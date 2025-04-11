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
    static async createBankAccount({  acc_name, account_no, pan_no, ifsc_code, gst_no, aadhar_no, others,mobile,mail,tan_no,user_type, bank_id, bank_account_type_id,loginId,is_active }, extras) {
       
        Validation.nullParameters([acc_name,account_no,pan_no]);

        const account = await BankAccount.create({
            acc_name,
            account_no,
            pan_no,
            ifsc_code,
            gst_no,
            aadhar_no,
            others,
            mobile,
            mail,
            tan_no,
            loginId,
            user_type,
            bank_id,
            bank_account_type_id,
            is_active,
        }, { transaction: extras.transaction });

        return account;
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
   static async updateBankAccounts({ bank_account_id,acc_name, account_no, pan_no, ifsc_code, gst_no, aadhar_no, others,mobile,mail,tan_no,user_type, bank_id,loginId, bank_account_type_id,is_active }, extras) {
        Validation.nullParameters([bank_account_id]);

       const account = await findModelOrThrow({ bank_account_id }, BankAccount, {
           transaction: extras.transaction,
           lock: true,
       });

       await account.update({
            acc_name,
            account_no,
            pan_no,
            ifsc_code,
            gst_no,
            aadhar_no,
            others,
            mobile,
            mail,
            tan_no,
            loginId,
            user_type,
            bank_id,
            bank_account_type_id,
            is_active,
       }, { transaction: extras.transaction });

       return account;
   }

    /**
     * 
     * @param {{
     *  type_id:string
     * }} param0 
     * @param {*} extras 
     */ 
    static async deleteBankAccount({ bank_account_id }, extras) {
        const account = await findModelOrThrow({ bank_account_id }, BankAccount);

        await account.destroy({ transaction: extras.transaction });
    }
}

module.exports = BankAccountService;