const { Partner } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class PartnerService {
    /**
     * 
     * @param {{
     * partner_type_id:string
     * branch_id:string    
     * name:string
     * email:string
     * mobile_no:string
     * password:string
     * confirm_password:string
     * door_no:string
     * street:string
     * pin_code:string
     * city_id:string
     * staff_id:string   
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createPartner({ name, is_active, branch_id, city_id, confirm_password, door_no,
        email, mobile_no, partner_type_id, password, pin_code, staff_id, street }, extras) {
        Validation.nullParameters([
            name,
            branch_id,
            name,
            email,
            mobile_no,
            password,
            confirm_password,
        ]);

        Validation.password(password, confirm_password);

        const partner = await Partner.create({
            partner_type_id,
            branch_id,
            name,
            email,
            mobile_no,
            password,
            confirm_password,
            door_no,
            street,
            pin_code,
            city_id,
            staff_id,
            is_active,
        }, { transaction: extras.transaction });

        return partner;
    }

    /**
     * 
     * @param {{
     * partner_id:string
     * partner_type_id:string
     * branch_id:string    
     * name:string
     * email:string
     * mobile_no:string
     * password:string
     * confirm_password:string
     * door_no:string
     * street:string
     * pin_code:string
     * city_id:string
     * staff_id:string   
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras
     */
    static async updatePartner({ partner_id, name, branch_id, city_id, confirm_password, door_no,
        email, mobile_no, password, pin_code, staff_id, street, is_active, partner_type_id }, extras) {
        // Validation.nullParameters([partner_type_id]);

        const partner = await findModelOrThrow({ partner_id }, Partner);

        await partner.update({
            partner_type_id,
            branch_id,
            name,
            email,
            mobile_no,
            password,
            confirm_password,
            door_no,
            street,
            pin_code,
            city_id,
            staff_id,
            is_active,
        }, { transaction: extras.transaction });

        return partner;
    }

    /**
     * 
     * @param {{
     *  type_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deletePartner({ partner_id }, extras) {
        const partner = await findModelOrThrow({ partner_id }, Partner);

        await partner.destroy({ transaction: extras.transaction });
    }
}

module.exports = PartnerService;