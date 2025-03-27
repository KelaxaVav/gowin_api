const { Op } = require("sequelize");
const { Vendor } = require("../models");
const { findModelOrThrow, Validation, findModelAndThrow } = require("../utils/validation");

class VendorService {
    /**
     * 
     * @param {{
    * name:string
    * branch_id:string
    * mobile:string
    * }} param0 
    * @param {Extras} extras 
    * @returns 
    */
    static async createVendor({ name, branch_id, mobile }, extras) {
        Validation.nullParameters([name, branch_id, mobile]);
        await findModelAndThrow({
            branch_id,
            [Op.or]: [
                { name, },
                { mobile, },
            ],
        }, Vendor);

        const vendor = await Vendor.create({
            name,
            branch_id,
            mobile,
        }, { transaction: extras.transaction });

        return vendor;
    }

    /**
    * 
    * @param {{
    * vendor_id:string
    * branch_id:string
    * name:string
    * mobile:string
    * status:TVendorStatus
    * }} param0 
    * @param {Extras} extras 
    * @returns 
    */
    static async updateVendor({ vendor_id, branch_id, name, mobile, status }, extras) {
        Validation.nullParameters([name, mobile]);

        const vendor = await findModelOrThrow({ vendor_id }, Vendor);
        Validation.authority(branch_id, vendor.branch_id);

        await findModelAndThrow({
            vendor_id: { [Op.not]: vendor_id },
            [Op.or]: [
                { name, },
                { mobile, },
            ],
        }, Vendor);

        await vendor.update({
            name,
            mobile,
            status,
        }, { transaction: extras.transaction });

        return vendor;
    }

    /**
     * 
     * @param {{
     * vendor_id:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteVendor({ vendor_id, branch_id }, extras) {
        const vendor = await findModelOrThrow({ vendor_id }, Vendor, {
            throwOnDeleted: true,
            messageOnDeleted: "Vendor is already deleted",
        });
        Validation.authority(branch_id, vendor.branch_id);

        await vendor.destroy({ transaction: extras.transaction });
    }
}

module.exports = VendorService;
