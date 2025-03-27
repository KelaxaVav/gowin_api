const {   BankAccount } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class BankAccountService {
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
    static async createBankAccount({  name, account_no, pan_no, ifsc_code, gst_no, aadhar_no, other_names, bank_id, bank_account_type_id,is_active }, extras) {
       
        Validation.nullParameters([name]);

        const teams = await BankAccount.create({
            name,
            account_no,
            pan_no,
            ifsc_code,
            gst_no,
            aadhar_no,
            other_names,
            bank_id,
            bank_account_type_id,
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
   static async updateBankAccounts({ account_no, name, is_active }, extras) {
        Validation.nullParameters([account_no]);

       const teams = await findModelOrThrow({ account_no }, BankAccount, {
           transaction: extras.transaction,
           lock: true,
       });

       await teams.update({
            name,
            account_no,
            pan_no,
            ifsc_code,
            gst_no,
            aadhar_no,
            other_names,
            bank_id,
            bank_account_type_id,
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
    static async deleteBankAccount({ account_no }, extras) {
        const type = await findModelOrThrow({ account_no }, BankAccount);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = BankAccountService;