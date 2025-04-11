const {   City } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class CityService {
    /**
     * 
     * @param {{
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createCity({  name, state_id, is_active }, extras) {
        Validation.nullParameters([name]);

        const cities = await City.create({
            name,
            state_id,
            is_active,
        }, { transaction: extras.transaction });

        return cities;
    }

    /**
     * 
     * @param {{
    * city_id:string
    * state_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateCities({ city_id,state_id, name, is_active }, extras) {
        Validation.nullParameters([city_id]);

       const cities = await findModelOrThrow({ city_id }, City, {
           transaction: extras.transaction,
           lock: true,
       });

       await cities.update({
        name,
        state_id,
        is_active,
       }, { transaction: extras.transaction });

       return cities;
   }

    /**
     * 
     * @param {{
     *  type_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteCity({ city_id }, extras) {
        const type = await findModelOrThrow({ city_id }, City);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = CityService;