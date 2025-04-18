const { Op } = require("sequelize");
const { Vendor } = require("../models");
const { findModelOrThrow, Validation, findModelAndThrow } = require("../utils/validation");

class VendorService {
    /**
     * 
     * @param {{
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createVendor({ name, is_active }, extras) {
        Validation.nullParameters([name, is_active]);
        await findModelAndThrow({
            [Op.or]: [
                { name, },
            ],
        }, Vendor);

        const vendor = await Vendor.create({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return vendor;
    }

    /**
    * 
    * @param {{
    * vendor_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras 
    * @returns 
    */
    static async updateVendor({ vendor_id, name, is_active }, extras) {
        Validation.nullParameters([name]);

        const vendor = await findModelOrThrow({ vendor_id }, Vendor);

        await findModelAndThrow({
            vendor_id: { [Op.not]: vendor_id },
            [Op.or]: [
                { name, },
            ],
        }, Vendor);

        await vendor.update({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return vendor;
    }

    /**
     * 
     * @param {{
     * vendor_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteVendor({ vendor_id }, extras) {
        const vendor = await findModelOrThrow({ vendor_id }, Vendor, {
            throwOnDeleted: true,
            messageOnDeleted: "Vendor is already deleted",
        });

        await vendor.destroy({ transaction: extras.transaction });
    }
}

module.exports = VendorService;
