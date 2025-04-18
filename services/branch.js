const { Op } = require("sequelize");
const { v4 } = require("uuid");
const { Branch, Category, Role, Position, Customer, User, Staff } = require("../models");
const { Validation, findModelAndThrow, findModelOrThrow } = require("../utils/validation");
const UserService = require("./user");
const StaffService = require("./staff");
const { ROLES } = require("../data/constants");

class BranchService {
    /**
     * Create a new branch
     * @param {{
     * branch_id?:string
     * name:string
     * region_id:string
     * designation_id?:string
     * city_id?:string
     * is_active:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async createBranch({ name, branch_id, region_id, designation_id, city_id, is_active }, extras) {
        Validation.nullParameters([
            name,
            region_id,
            is_active,
        ]);

        const b = await findModelAndThrow({
            [Op.or]: [
                { name },
            ],
        }, Branch);

        if (!branch_id) {
            branch_id = v4();
        }

        const branch = await Branch.create({
            branch_id,
            name,
            region_id,
            is_active,
            // roles: [
            //     { name: 'BRANCH_ADMIN' },
            //     { name: 'BRANCH_MANAGER' },
            //     { name: 'RELATIONSHIP_MANAGER' },
            // ],
        }, {
            // include: [
            //     {
            //         model: Role,
            //         as: 'roles',
            //     },
            // ],
            transaction: extras.transaction,
        });

        await StaffService.createStaff({
            branch_id: branch.branch_id,
            name: "Branch Admin",
            email: `admin.${name}@gmail.com`.toLowerCase(),
            mobile_no: name.toLowerCase(),
            password: '12345678',
            confirm_password: '12345678',
            role: ROLES.BRANCH_ADMIN,

            dob: new Date(),
            blood_group: '',
            door_no: '',
            street: '',
            pin_code: '',
            is_active: true,
            designation_id,
            city_id,
        }, extras);

        return branch;
    }

    /**
     * Update branch
     * @param {{
     * branch_id:string
     * name:string
     * region_id:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     */
    static async updateBranch({ branch_id, name, region_id, is_active }, extras) {
        Validation.nullParameters([
            name,
        ]);

        const branch = await findModelOrThrow({ branch_id }, Branch);

        await findModelAndThrow({
            branch_id: { [Op.not]: branch_id },
            [Op.or]: [
                { name },
            ],
        }, Branch);

        await branch.update({
            name,
            region_id,
            is_active,
        }, { transaction: extras.transaction });

        return branch;
    }

    /**
     * Update branch settings
     * @param {{
     * branch_id:string
     * settings:TBranchSetting
     * }} param0 
     * @param {Extras} extras 
     */
    static async updateBranchSettings({ branch_id, settings }, extras) {
        Validation.nullParameters([branch_id, settings]);
        Validation.isTrue(Object.keys(settings).length);

        const branch = await findModelOrThrow({ branch_id }, Branch);

        /** @type {TBranchSetting} */
        const updatedSettings = { ...branch.settings };

        for (const key in settings) {
            const setting = settings[key];
            updatedSettings[key] = setting;
        }

        await branch.update({ settings: updatedSettings }, { transaction: extras.transaction });

        return branch;
    }

    /**
     * Get branch settings
     * @param {string} branch_id 
     * @returns {Promise<TBranchSetting>}
     */
    static async getBranchSettings(branch_id) {
        const branch = await findModelOrThrow({ branch_id }, Branch);

        return branch.dataValues.settings;
    }

    /**
      * 
      * @param {string} branch_id 
      * @param {Extras} extras 
      */
    static async deleteBranch(branch_id, extras) {
        const branch = await findModelOrThrow({ branch_id }, Branch, {
            throwOnDeleted: true,
            messageOnDeleted: "Branch is already deleted",
        });

        await branch.destroy({ transaction: extras.transaction });
    }
}

module.exports = BranchService;