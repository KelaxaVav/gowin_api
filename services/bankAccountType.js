const {   BankAccountType } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class BankAccountTypeService {
    /**
     * 
     * @param {{
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createBankAccountType({  name, is_active }, extras) {
        Validation.nullParameters([name]);

        const teams = await BankAccountType.create({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return teams;
    }

    /**
     * 
     * @param {{
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateBankAccountTypes({ bank_account_type_id, name, is_active }, extras) {
        Validation.nullParameters([bank_account_type_id]);

       const teams = await findModelOrThrow({ bank_account_type_id }, BankAccountType, {
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
    static async deleteBankAccountType({ bank_account_type_id }, extras) {
        const type = await findModelOrThrow({ bank_account_type_id }, BankAccountType);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = BankAccountTypeService;