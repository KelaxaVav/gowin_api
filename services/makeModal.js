const {   MakeModal } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class MakeModalService {
    /**
     * 
     * @param {{
     * make_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createMakeModal({ make_id, name, is_active }, extras) {
        Validation.nullParameters([make_id,name]);

        const makeModal = await MakeModal.create({
            make_id,
            name,
            is_active,
        }, { transaction: extras.transaction });

        return makeModal;
    }

    /**
     * 
     * @param {{
    * make_modal_id:string
    * make_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateMakeModal({ make_modal_id,make_id,name, is_active }, extras) {
        Validation.nullParameters([make_modal_id]);

       const makeModal = await findModelOrThrow({ make_modal_id }, MakeModal, {
           transaction: extras.transaction,
           lock: true,
       });

       await makeModal.update({
        make_id,
        name,
        is_active,
       }, { transaction: extras.transaction });

       return makeModal;
   }

    /**
     * 
     * @param {{
     *  make_modal_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteMakeModal({ make_modal_id }, extras) {
        const makeModal = await findModelOrThrow({ make_modal_id }, MakeModal);

        await makeModal.destroy({ transaction: extras.transaction });
    }
}

module.exports = MakeModalService;