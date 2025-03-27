const {   Region } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class RegionService {
    /**
     * 
     * @param {{
     * region_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createType({  name, is_active }, extras) {
        Validation.nullParameters([name]);

        const regions = await Region.create({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return regions;
    }

    /**
     * 
     * @param {{
    * region_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateTypes({ region_id, name, is_active }, extras) {
        Validation.nullParameters([region_id]);

       const regions = await findModelOrThrow({ region_id }, Region, {
           transaction: extras.transaction,
           lock: true,
       });

       await regions.update({
        name,
        is_active,
       }, { transaction: extras.transaction });

       return regions;
   }

    /**
     * 
     * @param {{
     *  type_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteType({ region_id }, extras) {
        const type = await findModelOrThrow({ region_id }, Region);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = RegionService;