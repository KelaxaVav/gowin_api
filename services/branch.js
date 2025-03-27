const { Op } = require("sequelize");
const { v4 } = require("uuid");
const { Branch, Category, Role, Position, Customer, User } = require("../models");
const { Validation, findModelAndThrow, findModelOrThrow } = require("../utils/validation");
const UserService = require("./user");

class BranchService {
    /**
     * Create a new branch
     * @param {{
     * branch_id?:string
     * name:string
     * code:string
     * contact:string[]
     * address:string
     * settings:TBranchSetting
     * }} param0 
     * @param {Extras} extras 
     */
    static async createBranch({ name, contact, address, code, settings, branch_id }, extras) {
        Validation.nullParameters([
            name,
            code,
            contact,
            address,
        ]);

        await findModelAndThrow({
            [Op.or]: [
                { name },
                { code },
            ],
        }, Branch);

        if (!branch_id) {
            branch_id = v4();
        }

        const branch = await Branch.create({
            branch_id,
            name,
            code,
            contact,
            address,
            mainCategories: [
                {
                    name: 'POS_MENU',
                    options: [
                        { name: 'Custom Cake', branch_id, children: [] }
                    ],
                },
                { name: 'UNCATEGORIZED' },
                { name: 'CUSTOM_PRESET' },
            ],
            roles: [{ name: 'Branch Admin' }],
            positions: [{ name: 'Branch Manager' }],
            customers: [{ name: "Walk In", mobile: contact[0] }],
            settings: {
                reward: {
                    status: settings?.reward?.status ?? false,
                    value: settings?.reward?.value ?? 0,
                },
            },
        }, {
            include: [
                {
                    model: Customer,
                    as: 'customers',
                },
                {
                    model: Category,
                    as: 'mainCategories',
                    include: [
                        {
                            model: Category,
                            as: 'options',
                        },
                    ],
                },
                {
                    model: Role,
                    as: 'roles',
                    include: [
                        {
                            model: User,
                            as: 'users',
                        }
                    ],
                },
                {
                    model: Position,
                    as: 'positions',
                },
            ],
            transaction: extras.transaction,
        });

        await UserService.createUser({
            branch_id: branch.branch_id,
            name: "Branch Admin",
            email: `admin.${name}@gmail.com`.toLowerCase(),
            nic: branch.code,
            mobile: contact[0],
            password: '12345678',
            confirm_password: '12345678',
            role_id: branch.roles[0].role_id,
            position_id: branch.positions[0].position_id,
        }, extras);

        return branch;
    }

    /**
     * Update branch
     * @param {{
    * branch_id:string
    * code:string
    * name:string
    * contact:string[]
    * address:string
    * settings:TBranchSetting
    * }} param0 
    * @param {Extras} extras 
    */
    static async updateBranch({ branch_id, name, contact, address, code, settings }, extras) {
        Validation.nullParameters([
            name,
            code,
            contact,
            address,
        ]);

        const branch = await findModelOrThrow({ branch_id }, Branch);

        await findModelAndThrow({
            branch_id: { [Op.not]: branch_id },
            [Op.or]: [
                { name },
                { code },
            ],
        }, Branch);

        await branch.update({
            name,
            code,
            contact,
            address,
        }, { transaction: extras.transaction });

        settings && await this.updateBranchSettings({ branch_id, settings }, extras);

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