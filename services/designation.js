const { Designation } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class DesignationService {
    /**
     * 
     * @param {{
     * designation_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createDesignation({ name, is_active }, extras) {
        Validation.nullParameters([name]);

        const designation = await Designation.create({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return designation;
    }

    /**
     * 
     * @param {{
    * designation_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
    static async updateDesignation({ designation_id, name, is_active }, extras) {
        Validation.nullParameters([designation_id]);

        const teams = await findModelOrThrow({ designation_id }, Designation, {
            transaction: extras.transaction,
            lock: true,
        });

        await teams.update({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return teams;
    }

    /**
     * 
     * @param {{
     *  type_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteDesignation({ designation_id }, extras) {
        const type = await findModelOrThrow({ designation_id }, Designation);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = DesignationService;