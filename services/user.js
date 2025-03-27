const { Op } = require("sequelize");
const { User, Role, Position, Branch } = require("../models");
const { Validation, findModelOrThrow, findModelAndThrow } = require("../utils/validation");
const AppError = require("../utils/appError");
const { STATUS_CODE } = require("../utils/utility");
const bcrypt = require('bcrypt');

class UserService {
    /**
     * Validate users with given branch_id
     * @param {string} branch_id 
     * @param {{
     * user_id:string
     * }[]} users 
     */
    static async validateUsersWithBranch(branch_id, users) {
        if (!users.length) {
            return;
        }

        const findUsers = await User.findAll({
            include: [
                {
                    model: Role,
                    as: 'role',
                },
            ],
            where: {
                '$role.branch_id$': branch_id,
                user_id: {
                    [Op.in]: users.map(user => user.user_id),
                },
            },
        });
        Validation.isTrue(findUsers.length == users.length);
    }

    static async createUniqueStaffNo() {
        const prefix = 'ST';
        try {
            let isFound = false;
            let newStaffNo;
            do {
                const user = await User.findOne({
                    order: [['created_at', 'DESC']],
                    paranoid: false,
                });

                let staffNo;
                if (user) {
                    staffNo = parseInt(user.staff_no.split(prefix).pop());
                    staffNo++;
                    staffNo = prefix + staffNo.toString().padStart(4, '0');
                } else {
                    staffNo = 1;
                    staffNo = prefix + staffNo.toString().padStart(4, '0');
                }

                console.log(staffNo);

                const existingUser = await User.findOne({ where: { staff_no: staffNo } });
                isFound = existingUser != null;
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
     * nic:string
     * mobile:number    
     * password:string
     * confirm_password:string
     * role_id:string
     * position_id:string
     * salary:number
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createUser({ branch_id, name, email, nic, mobile, password, confirm_password, role_id, position_id, salary }, extras) {
        Validation.nullParameters([
            name,
            email,
            nic,
            mobile,
            password,
            confirm_password,
            role_id,
            position_id,
        ]);
        Validation.password(password, confirm_password);
        salary && Validation.isTrue(salary > 0);

        await findModelOrThrow({ role_id, branch_id }, Role, { transaction: extras.transaction });
        await findModelOrThrow({ position_id, branch_id }, Position, { transaction: extras.transaction });
        await findModelAndThrow({
            [Op.or]: [
                { email },
                { mobile },
                { nic },
            ],
        }, User, {
            throwOnDeleted: true,
            messageOnDeleted: "User account with this email/name/mobile/nic is deleted",
            messageOnFound: "User account exist with this email/name/mobile/nic",
        });

        const staff_no = await this.createUniqueStaffNo();
        const user = await User.create({
            name,
            staff_no,
            email,
            nic,
            mobile,
            password,
            role_id,
            position_id,
            settings: {
                salary: salary ?? null,
            },
        }, { transaction: extras.transaction, });

        return user;
    }

    /**
     * Update user
     * @param {{
     * user_id:string
     * branch_id:string
     * name:string
     * email:string
     * nic:string
     * mobile:number
     * password:string
     * confirm_password:string
     * role_id:string
     * position_id:string
     * status:TUserStatus
     * salary:number
     * }} param0 
     * @param {Extras} extras 
    */
    static async updateUser({ user_id, branch_id, name, email, nic, mobile, password, confirm_password, role_id, position_id, status, salary }, extras) {
        const user = await findModelOrThrow({ user_id }, User, {
            include: [
                {
                    model: Role,
                    as: 'role',
                },
            ],
            throwOnDeleted: true,
        });
        Validation.authority(branch_id, user.role.branch_id);
        Validation.password(password, confirm_password);

        salary && Validation.isTrue(salary > 0);

        if (role_id && role_id != user.role_id) {
            await findModelOrThrow({ role_id, branch_id }, Role);
        }
        if (position_id && position_id != user.position_id) {
            await findModelOrThrow({ position_id, branch_id }, Position);
        }

        const universalUniqueFields = { nic, mobile, email };
        await Promise.all(Object.keys(universalUniqueFields).map(async key => {
            const value = universalUniqueFields[key];

            if (value && value != user[key]) {
                await findModelAndThrow({
                    [key]: value,
                    user_id: {
                        [Op.not]: user_id,
                    },
                }, User, {
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                    throwOnDeleted: true,
                    messageOnDeleted: `User with this ${key} is deleted`,
                    messageOnFound: `User with this ${key} is exist`,
                });
            }
        }));


        await user.update({
            name,
            email,
            nic,
            mobile,
            password,
            role_id,
            position_id,
            status,
            settings: {
                salary,
            }
        }, { transaction: extras.transaction });

        await user.reload({ transaction: extras.transaction });

        return user;
    }

    /**
     * Update profile
     * @param {{
     * user_id:string
     * name:string
     * email:string
     * mobile:number
     * }} param0 
     * @param {Extras} extras 
     */
    static async updateProfile({ user_id, name, email, mobile }, extras) {
        const user = await findModelOrThrow({ user_id }, User);

        Validation.emptyStringParameters([name, mobile, email]);

        const universalUniqueFields = { mobile, email };
        await Promise.all(Object.keys(universalUniqueFields).map(async key => {
            const value = universalUniqueFields[key];

            if (value && value != user[key]) {
                await findModelAndThrow({
                    [key]: value,
                    user_id: {
                        [Op.not]: user_id,
                    },
                }, User, {
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                    throwOnDeleted: true,
                    messageOnDeleted: `User with this ${key} is deleted`,
                    messageOnFound: `User with this ${key} is exist`,
                });
            }
        }));

        await user.update({
            name,
            email,
            mobile,
        }, { transaction: extras.transaction });

        return user;
    }

    /**
     * 
     * @param {{
     * user_id:string
     * current_password:string
     * password:string
     * confirm_password:string
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async changePassword({ user_id, current_password, password, confirm_password }, extras) {
        const user = await findModelOrThrow({ user_id }, User);

        Validation.password(password, confirm_password);

        if (!bcrypt.compareSync(current_password, user.password_hash)) {
            throw new AppError("Wrong current password", STATUS_CODE.BAD_REQUEST);
        }

        await user.update({ password }, { transaction: extras.transaction });
    }

    /**
     * Delete user
     * @param {{
     * user_id:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteUser({ user_id, branch_id }, extras) {
        const user = await findModelOrThrow({ user_id }, User, {
            include: [
                {
                    model: Role,
                    as: 'role',
                }
            ],
            throwOnDeleted: true,
            messageOnDeleted: "User account not found",
        });
        Validation.authority(branch_id, user.role.branch_id);

        await user.destroy({ transaction: extras.transaction });
    }
}

module.exports = UserService;