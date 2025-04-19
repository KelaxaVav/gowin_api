const { Policy } = require("../models");
const { findModelOrThrow, Validation, findModelAndThrow } = require("../utils/validation");

class PolicyService {
    /**
     * 
     * @param {{
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createModal({ policy_no, age, chassis_no, yom, cpa, gvw, cc, seating, kw, odp,
        net_premium, issued_date, tp_start_date, od_start_date, insured_name, insured_id, mobile_no,
        email_id, reg_no, tpp, gross_premium, reg_date, tp_expiry_date, od_expiry_date,
        product_id, partner_id, loginId_id, is_active }, extras) {

        Validation.nullParameters([policy_no]);

        await findModelAndThrow({ policy_no }, Policy);

        const policy = await Policy.create({
            policy_no,
            age,
            chassis_no,
            yom,
            cpa,
            gvw,
            cc,
            seating,
            kw,
            odp,
            net_premium,
            issued_date,
            tp_start_date,
            od_start_date,
            insured_name,
            insured_id,
            mobile_no,
            email_id,
            reg_no,
            tpp,
            gross_premium,
            reg_date,
            tp_expiry_date,
            od_expiry_date,
            product_id,
            partner_id,
            loginId_id,
            is_active,
        }, { transaction: extras.transaction });

        return policy;
    }

    /**
     * 
     * @param {{
    * policy_id:string
    * insurer_id:string
    * make_modal_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
    static async updateModal({ policy_id, insurer_id, make_modal_id, name, is_active }, extras) {
        Validation.nullParameters([policy_id]);

        const policy = await findModelOrThrow({ policy_id }, Policy, {
            transaction: extras.transaction,
            lock: true,
        });

        await policy.update({
            policy_id,
            insurer_id,
            make_modal_id,
            name,
            is_active,
        }, { transaction: extras.transaction });

        return policy;
    }

    /**
     * 
     * @param {{
     *  modal_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteModal({ policy_id }, extras) {
        const policy = await findModelOrThrow({ policy_id }, Policy);

        await policy.destroy({ transaction: extras.transaction });
    }
}

module.exports = PolicyService;