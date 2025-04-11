const {   Modal } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class ModalService {
    /**
     * 
     * @param {{
     * make_id:string
     * make_modal_id:string
     * modal_name:string
     * gvw:string
     * cc:string
     * seater:string
     * kw:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createModal({ make_id,make_modal_id,modal_name, gvw, cc, seater, kw,  is_active }, extras) {
        Validation.nullParameters([modal_name,make_modal_id]);

        const modals = await Modal.create({
            make_id,
            make_modal_id,
            modal_name,
            gvw,
            cc,
            seater,
            kw,
            is_active,
        }, { transaction: extras.transaction });

        return modals;
    }

    /**
     * 
     * @param {{
    * modal_id:string
    * make_modal_id:string
    * modal_name:string
    * gvw:string
    * cc:string
    * seater:string
    * kw:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateModal({ modal_id,make_modal_id,modal_name,gvw, cc,seater,kw, is_active }, extras) {
        Validation.nullParameters([modal_id]);

       const modals = await findModelOrThrow({ modal_id }, Modal, {
           transaction: extras.transaction,
           lock: true,
       });

       await modals.update({
        make_modal_id,
        modal_name,
        gvw,
        cc,
        seater,
        kw,
        kw,
        is_active,
       }, { transaction: extras.transaction });

       return modals;
   }

    /**
     * 
     * @param {{
     *  modal_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteModal({ modal_id }, extras) {
        const modal = await findModelOrThrow({ modal_id }, Modal);

        await modal.destroy({ transaction: extras.transaction });
    }
}

module.exports = ModalService;