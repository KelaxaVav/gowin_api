const {   State } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class StateService {
    /**
     * 
     * @param {{
     * team_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createState({  name, is_active }, extras) {
        Validation.nullParameters([name]);

        const states = await State.create({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return states;
    }

    /**
     * 
     * @param {{
    * team_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateStates({ state_id, name, is_active }, extras) {
        Validation.nullParameters([state_id]);

       const states = await findModelOrThrow({ state_id }, State, {
           transaction: extras.transaction,
           lock: true,
       });

       await states.update({
        name,
        is_active,
       }, { transaction: extras.transaction });

       return states;
   }

    /**
     * 
     * @param {{
     *  type_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteState({ state_id }, extras) {
        const type = await findModelOrThrow({ state_id }, State);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = StateService;