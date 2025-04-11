const {    LoginId } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class LoginIdService {
    /**
     * 
     * @param {{
     * insurer_id:string
     * loginId:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createLoginId({ loginId,insurer_id, is_active }, extras) {
        Validation.nullParameters([loginId,insurer_id]);

        const loginIds = await LoginId.create({
            loginId,
            insurer_id,
            is_active,
        }, { transaction: extras.transaction });

        return loginIds;
    }

    /**
     * 
     * @param {{
    * loginId_id:string
    * loginId:string
    * insurer_id:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateLoginId({ loginId_id,loginId,insurer_id,is_active }, extras) {
        Validation.nullParameters([loginId_id]);

       const loginIds = await findModelOrThrow({ loginId_id }, LoginId, {
           transaction: extras.transaction,
           lock: true,
       });

       await loginIds.update({
        loginId,
        insurer_id,
        is_active,
       }, { transaction: extras.transaction });

       return loginIds;
   }

    /**
     * 
     * @param {{
     *  rto_category_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteLoginId({ loginId_id }, extras) {
        const loginId = await findModelOrThrow({ loginId_id }, LoginId);

        await loginId.destroy({ transaction: extras.transaction });
    }
}

module.exports = LoginIdService;