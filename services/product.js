const { Product } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class ProductService {
    /**
     * 
     * @param {{
     * insurer_id:string
     * make_modal_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createModal({ insurer_id,make_modal_id,name, is_active }, extras) {
        Validation.nullParameters([insurer_id,make_modal_id,name]);

        const product = await Product.create({
            insurer_id,
            make_modal_id,
            name,
            is_active,
        }, { transaction: extras.transaction });

        return product;
    }

    /**
     * 
     * @param {{
    * product_id:string
    * insurer_id:string
    * make_modal_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateModal({ product_id,insurer_id,make_modal_id,name, is_active }, extras) {
        Validation.nullParameters([product_id]);

       const product = await findModelOrThrow({ product_id }, Product, {
           transaction: extras.transaction,
           lock: true,
       });

       await product.update({
        product_id,
        insurer_id,
        make_modal_id,
        name,
        is_active,
       }, { transaction: extras.transaction });

       return product;
   }

    /**
     * 
     * @param {{
     *  modal_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteModal({ product_id }, extras) {
        const product = await findModelOrThrow({ product_id }, Product);
        
        await product .destroy({ transaction: extras.transaction });
    }
}

module.exports = ProductService;