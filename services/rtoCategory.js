const {   RTOCategory } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class RTOCategoryService {
    /**
     * 
     * @param {{
     * state_id:string
     * insurer_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createRTOCategory({ state_id,insurer_id, name, is_active }, extras) {
        Validation.nullParameters([state_id,insurer_id, name]);

        const rtoCategory = await RTOCategory.create({
            state_id,
            insurer_id,
            name,
            is_active,
        }, { transaction: extras.transaction });

        return rtoCategory;
    }

    /**
     * 
     * @param {{
    * rto_category_id:string
    * state_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateRTOCategory({ rto_category_id, state_id,insurer_id,name, is_active }, extras) {
        Validation.nullParameters([rto_category_id]);

       const rtoCategory = await findModelOrThrow({ rto_category_id }, RTOCategory, {
           transaction: extras.transaction,
           lock: true,
       });

       await rtoCategory.update({
        state_id,
        insurer_id,
        name,
        is_active,
       }, { transaction: extras.transaction });

       return rtoCategory;
   }

    /**
     * 
     * @param {{
     *  rto_category_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteRTOCategory({ rto_category_id }, extras) {
        const rtoCategory = await findModelOrThrow({ rto_category_id }, RTOCategory);

        await rtoCategory.destroy({ transaction: extras.transaction });
    }
}

module.exports = RTOCategoryService;