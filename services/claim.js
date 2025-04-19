const { createUniqueNo } = require(".");
const { Claim } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class ClaimService {
    /**
     * 
     * @param {{
     * claim_id:string
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createClaim({ policy_id, intimate_by, accident_date, claim_intimation_date, surveyar_name,
        surveyar_mobile, claim_approval_date, claim_settled_date, document_submitted, bill_amount,
        liablity_amount, settle_net_amount, settle_gst_amount, settle_total_amount, status }, extras) {

        // Validation.nullParameters([name]);

        const claim_no = await createUniqueNo(Claim, { prefix: 'GC' });

        const teams = await Claim.create({
            policy_id,
            claim_no,
            intimate_by,
            accident_date,
            claim_intimation_date,
            surveyar_name,
            surveyar_mobile,
            claim_approval_date,
            claim_settled_date,
            document_submitted,
            bill_amount,
            liablity_amount,
            settle_net_amount,
            settle_gst_amount,
            settle_total_amount,
            status,
        }, { transaction: extras.transaction });

        return teams;
    }

    /**
     * 
     * @param {{
     * claim_id:string
     * }} param0 
     * @param {Extras} extras
     */
    static async updateClaim({ claim_id, intimate_by, accident_date, claim_intimation_date, surveyar_name,
        surveyar_mobile, claim_approval_date, claim_settled_date, document_submitted, bill_amount,
        liablity_amount, settle_net_amount, settle_gst_amount, settle_total_amount, status }, extras) {

        Validation.nullParameters([claim_id]);

        const claim = await findModelOrThrow({ claim_id }, Claim, {
            transaction: extras.transaction,
            lock: true,
        });

        await claim.update({
            intimate_by,
            accident_date,
            claim_intimation_date,
            surveyar_name,
            surveyar_mobile,
            claim_approval_date,
            claim_settled_date,
            document_submitted,
            bill_amount,
            liablity_amount,
            settle_net_amount,
            settle_gst_amount,
            settle_total_amount,
            status,
        }, { transaction: extras.transaction });

        return claim;
    }

    /**
     * 
     * @param {{
     *  type_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteClaim({ claim_id }, extras) {
        const type = await findModelOrThrow({ claim_id }, Claim);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = ClaimService;