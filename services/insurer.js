const {   Insurer } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class InsurerService {
    /**
     * 
     * @param {{
     * insurer_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createInsurer({  name, is_active }, extras) {
        Validation.nullParameters([name]);

        const teams = await Insurer.create({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return teams;
    }

    /**
     * 
     * @param {{
    * insurer_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateInsurers({ insurer_id, name, is_active }, extras) {
        Validation.nullParameters([insurer_id]);

       const teams = await findModelOrThrow({ insurer_id }, Insurer, {
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
    static async deleteInsurer({ insurer_id }, extras) {
        const type = await findModelOrThrow({ insurer_id }, Insurer);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = InsurerService;