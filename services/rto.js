const {   RTO } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class RTOService {
    /**
     * 
     * @param {{
     * state_id:string
     * rto_category_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createRTO({ state_id,rto_category_id, name, is_active }, extras) {
        Validation.nullParameters([state_id, name]);

        const rtos = await RTO.create({
            state_id,
            rto_category_id,
            name,
            is_active,
        }, { transaction: extras.transaction });

        return rtos;
    }

    /**
     * 
     * @param {{
    * rto_id:string
    * state_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateRTOs({ rto_id,rto_category_id, state_id,name, is_active }, extras) {
        Validation.nullParameters([rto_id]);

       const rtos = await findModelOrThrow({ rto_id }, RTO, {
           transaction: extras.transaction,
           lock: true,
       });

       await rtos.update({
        state_id,
        rto_category_id,
        name,
        is_active,
       }, { transaction: extras.transaction });

       return rtos;
   }

    /**
     * 
     * @param {{
     *  rto_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteRTO({ rto_id }, extras) {
        const rto = await findModelOrThrow({ rto_id }, RTO);

        await rto.destroy({ transaction: extras.transaction });
    }
}

module.exports = RTOService;