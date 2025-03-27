const {   PartnerType } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class PartnerTypeService {
    /**
     * 
     * @param {{
     * partner_type_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createType({  name, is_active }, extras) {
        Validation.nullParameters([name]);

        const teams = await PartnerType.create({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return teams;
    }

    /**
     * 
     * @param {{
    * partner_type_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateTypes({ partner_type_id, name, is_active }, extras) {
        Validation.nullParameters([partner_type_id]);

       const teams = await findModelOrThrow({ partner_type_id }, PartnerType, {
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
    static async deleteType({ partner_type_id }, extras) {
        const type = await findModelOrThrow({ partner_type_id }, PartnerType);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = PartnerTypeService;