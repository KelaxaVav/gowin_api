const {  Type } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class TypesService {
    /**
     * 
     * @param {{
     * type_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createType({  name, is_active,type }, extras) {
        Validation.nullParameters([name]);

        const types = await Type.create({
            name,
            is_active,
            type
        }, { transaction: extras.transaction });

        return types;
    }

    /**
     * 
     * @param {{
    * type_id:string
    * name:string
    * is_active:boolean
    * type:string
    * }} param0 
    * @param {Extras} extras
    */
   static async updateTypes({ type_id, name, is_active, type }, extras) {
        Validation.nullParameters([type_id]);

       const types = await findModelOrThrow({ type_id }, Type, {
           transaction: extras.transaction,
           lock: true,
       });

       await types.update({
        name,
        is_active,
        type,
       }, { transaction: extras.transaction });

       return types;
   }

    /**
     * 
     * @param {{
     *  type_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteType({ type_id }, extras) {
        const type = await findModelOrThrow({ type_id }, Type);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = TypesService;