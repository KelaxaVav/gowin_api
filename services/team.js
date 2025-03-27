const {   Team } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class TeamService {
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
    static async createType({  name, is_active }, extras) {
        Validation.nullParameters([name]);

        const teams = await Team.create({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return teams;
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
   static async updateTypes({ team_id, name, is_active }, extras) {
        Validation.nullParameters([team_id]);

       const teams = await findModelOrThrow({ team_id }, Team, {
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
    static async deleteType({ team_id }, extras) {
        const type = await findModelOrThrow({ team_id }, Team);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = TeamService;