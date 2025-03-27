const { Op } = require("sequelize");
const { Setting } = require("../models");
const { findModelOrThrow, Validation, findModelAndThrow } = require("../utils/validation");

class SettingService {
    /**
     * 
     * @param {{
     * name:string
     * type:string
     * data:any
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createSetting({ name, type, data }, extras) {
        Validation.nullParameters([name, type, data]);
        await findModelAndThrow({
            name,
            type,
        }, Setting, { throwOnDeleted: true });

        const setting = await Setting.create({
            name,
            type,
            data,
        }, { transaction: extras.transaction });

        return setting;
    }

    /**
     * 
     * @param {{
     * setting_id:string
     * name:string
     * type:string
     * data:any
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async updateSetting({ setting_id, name, type, data }, extras) {
        Validation.nullParameters([name, type, data]);

        const setting = await findModelOrThrow({ setting_id }, Setting);

        await findModelAndThrow({
            setting_id: {
                [Op.not]: setting_id,
            },
            name,
            type,
        }, Setting, { throwOnDeleted: true });

        await setting.update({
            name,
            type,
            data,
        }, { transaction: extras.transaction });

        return setting;
    }

    /**
     * 
     * @param {{
     * setting_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteSetting({ setting_id }, extras) {
        const setting = await findModelOrThrow({ setting_id }, Setting, {
            throwOnDeleted: true,
            messageOnDeleted: "Setting is already deleted",
        });

        await setting.destroy({ transaction: extras.transaction });
    }

    /**
     * 
     * @param {string} type 
     * @returns {Promise<{[key:string]:any}>}
     */
    static async findSettingsByType(type) {
        /** @type {TSetting[]} */
        const settings = await Setting.findAll({
            where: {
                type,
            },
        });

        const data = settings.reduce((obj, setting) => {
            obj[setting.name] = setting.data;
            return obj;
        }, {});

        return data;
    }

    /**
     * 
     * @param {string} type
     * @param {string} name
     * @returns {Promise<any>}
     */
    static async findSettingByName(type, name) {
        /** @type {TSetting} */
        const setting = await findModelOrThrow({ name, type }, Setting);

        return setting;
    }
}

module.exports = SettingService;
