const { Op } = require("sequelize");
const { Staff, Role, Position, Branch, Designation, City } = require("../models");
const { Validation, findModelOrThrow, findModelAndThrow } = require("../utils/validation");
const AppError = require("../utils/appError");
const { STATUS_CODE } = require("../utils/utility");
const bcrypt = require('bcrypt');
const { ROLES } = require("../data/constants");

class StaffService {
    /**
     * Validate staffs with given branch_id
     * @param {string} branch_id 
     * @param {{
     * staff_id:string
     * }[]} staffs 
     */
    static async validateStaffsWithBranch(branch_id, staffs) {
        if (!staffs.length) {
            return;
        }

        const findStaffs = await Staff.findAll({
            include: [
                {
                    model: Role,
                    as: 'role',
                },
            ],
            where: {
                '$role.branch_id$': branch_id,
                staff_id: {
                    [Op.in]: staffs.map(staff => staff.staff_id),
                },
            },
        });
        Validation.isTrue(findStaffs.length == staffs.length);
    }

    static async createUniqueStaffNo() {
        const prefix = 'ST';
        try {
            let isFound = false;
            let newStaffNo;
            do {
                const staff = await Staff.findOne({
                    order: [['created_at', 'DESC']],
                    paranoid: false,
                });

                let staffNo;
                if (staff) {
                    staffNo = parseInt(staff.staff_no.split(prefix).pop());
                    staffNo++;
                    staffNo = prefix + staffNo.toString().padStart(4, '0');
                } else {
                    staffNo = 1;
                    staffNo = prefix + staffNo.toString().padStart(4, '0');
                }

                console.log(staffNo);

                const existingStaff = await Staff.findOne({ where: { staff_no: staffNo } });
                isFound = existingStaff != null;
                newStaffNo = staffNo;
            } while (isFound);

            return newStaffNo;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 
     * @param {{
     * branch_id:string    
     * name:string
     * email:string
     * mobile_no:string
     * password:string
     * confirm_password:string
     * role:TRoleName
     * dob:string
     * blood_group:string
     * door_no:string
     * street:string
     * pin_code:string
     * is_active:boolean
     * designation_id:string
     * city_id:string
     * team_id:string
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createStaff({ branch_id, name, email, mobile_no, password, confirm_password, role,
        blood_group, city_id, designation_id, dob, door_no, is_active, pin_code, street, team_id }, extras) {
        Validation.nullParameters([
            name,
            branch_id,
            name,
            email,
            mobile_no,
            password,
            confirm_password,
            role,
        ]);

        Validation.password(password, confirm_password);
        Validation.isTrue(ROLES[role]);

        designation_id && await findModelOrThrow({ designation_id }, Designation, { transaction: extras.transaction });
        city_id && await findModelOrThrow({ city_id }, City, { transaction: extras.transaction });

        await findModelAndThrow({
            [Op.or]: [
                { email },
                { mobile_no },
            ],
        }, Staff, {
            messageOnFound: "Staff exist with this email/mobile",
        });

        const staff = await Staff.create({
            name,
            branch_id,
            name,
            email,
            mobile_no,
            password,
            confirm_password,
            role,
            blood_group,
            designation_id,
            city_id,
            dob: new Date(dob).toISOString().split('T')[0],
            door_no,
            is_active,
            pin_code,
            street,
            team_id,
        }, { transaction: extras.transaction, });

        return staff;
    }

    /**
     * Update staff
     * @param {{
     * staff_id:string
     * branch_id:string    
     * name:string
     * email:string
     * mobile_no:string
     * password:string
     * confirm_password:string
     * role:string
     * dob:string
     * blood_group:string
     * door_no:string
     * street:string
     * pin_code:string
     * is_active:boolean
     * designation_id:string
     * city_id:string
     * team_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async updateStaff({ staff_id, branch_id, blood_group, city_id, confirm_password, designation_id,
        dob, door_no, email, is_active, mobile_no, name, password, pin_code, role, street, team_id }, extras) {
        const staff = await findModelOrThrow({ staff_id }, Staff, {
            throwOnDeleted: true,
        });

        branch_id = staff.branch_id;

        Validation.password(password, confirm_password);
        role && Validation.isTrue(ROLES[role]);

        if (designation_id && designation_id != staff.designation_id) {
            await findModelOrThrow({ designation_id }, Designation);
        }
        if (city_id && city_id != staff.city_id) {
            await findModelOrThrow({ city_id }, City);
        }

        const universalUniqueFields = { mobile_no, email };
        await Promise.all(Object.keys(universalUniqueFields).map(async key => {
            const value = universalUniqueFields[key];

            if (value && value != staff[key]) {
                await findModelAndThrow({
                    [key]: value,
                    staff_id: {
                        [Op.not]: staff_id,
                    },
                }, Staff, {
                    throwOnDeleted: true,
                    messageOnDeleted: `Staff with this ${key} is deleted`,
                    messageOnFound: `Staff with this ${key} is exist`,
                });
            }
        }));

        await staff.update({
            name,
            email,
            mobile_no,
            password,
            confirm_password,
            blood_group,
            dob: dob ? new Date(dob).toISOString().split('T')[0] : undefined,
            door_no,
            is_active,
            pin_code,
            street,
            role,
            branch_id,
            designation_id,
            city_id,
            team_id,
        }, { transaction: extras.transaction });

        await staff.reload({ transaction: extras.transaction });

        return staff;
    }

    /**
     * 
     * @param {{
     * staff_id:string
     * current_password:string
     * password:string
     * confirm_password:string
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async changePassword({ staff_id, current_password, password, confirm_password }, extras) {
        const staff = await findModelOrThrow({ staff_id }, Staff);

        Validation.password(password, confirm_password);

        if (!bcrypt.compareSync(current_password, staff.password_hash)) {
            throw new AppError("Wrong current password", STATUS_CODE.BAD_REQUEST);
        }

        await staff.update({ password }, { transaction: extras.transaction });
    }

    /**
     * Delete staff
     * @param {{
     * staff_id:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteStaff({ staff_id }, extras) {
        const staff = await findModelOrThrow({ staff_id }, Staff, {
            throwOnDeleted: true,
            messageOnDeleted: "Staff account not found",
        });

        await staff.destroy({ transaction: extras.transaction });
    }
}

module.exports = StaffService;