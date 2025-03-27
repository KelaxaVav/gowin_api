const {   Bank } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class BankService {
    /**
     * 
     * @param {{
     * bank_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createBank({  name, is_active }, extras) {
        Validation.nullParameters([name]);

        const teams = await Bank.create({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return teams;
    }

    /**
     * 
     * @param {{
    * bank_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateBanks({ bank_id, name, is_active }, extras) {
        Validation.nullParameters([bank_id]);

       const teams = await findModelOrThrow({ bank_id }, Bank, {
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
    static async deleteBank({ bank_id }, extras) {
        const type = await findModelOrThrow({ bank_id }, Bank);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = BankService;