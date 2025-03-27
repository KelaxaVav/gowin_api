const {   Make } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class MakeService {
    /**
     * 
     * @param {{
     * make_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createMake({  name, is_active }, extras) {
        Validation.nullParameters([name]);

        const teams = await Make.create({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return teams;
    }

    /**
     * 
     * @param {{
    * make_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateMakes({ make_id, name, is_active }, extras) {
        Validation.nullParameters([make_id]);

       const teams = await findModelOrThrow({ make_id }, Make, {
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
    static async deleteMake({ make_id }, extras) {
        const type = await findModelOrThrow({ make_id }, Make);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = MakeService;