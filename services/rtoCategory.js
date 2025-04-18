const { RTOCategory, RTO } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class RTOCategoryService {
    /**
     * 
     * @param {{
     * insurer_id:string
     * name:string
     * rto_ids:string[]
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createRTOCategory({ insurer_id, name, rto_ids, is_active }, extras) {
        Validation.nullParameters([insurer_id, name]);

        let rtos;
        if (rto_ids?.length) {
            rtos = await RTO.findAll({
                where: {
                    rto_id: rto_ids,
                },
            });
        }

        const rtoCategory = await RTOCategory.create({
            insurer_id,
            name,
            is_active,
        }, { transaction: extras.transaction });

        rtos?.length && await rtoCategory.setRtos(rtos, { transaction: extras.transaction });

        return rtoCategory;
    }

    /**
     * 
     * @param {{
     * rto_category_id:string
     * name:string
     * rto_ids:string[]
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras
     */
    static async updateRTOCategory({ rto_category_id, insurer_id, name, rto_ids, is_active }, extras) {
        Validation.nullParameters([rto_category_id]);

        const rtoCategory = await findModelOrThrow({ rto_category_id }, RTOCategory, {
            transaction: extras.transaction,
            lock: true,
        });

        let rtos;
        if (rto_ids?.length) {
            rtos = await RTO.findAll({
                where: {
                    rto_id: rto_ids,
                },
            });
        }

        await rtoCategory.update({
            insurer_id,
            name,
            is_active,
        }, { transaction: extras.transaction });

        rtos?.length && await rtoCategory.setRtos(rtos, { transaction: extras.transaction });

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