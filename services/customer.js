const { Customer } = require("../models");
const { Validation, findModelOrThrow } = require("../utils/validation");
const BranchService = require("./branch");

class CustomerService {
    /**
     * 
     * @param {{
     * name:string
     * mobile:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras
     */
    static async createCustomer({ name, mobile, branch_id }, extras) {
        Validation.nullParameters([mobile, branch_id]);

        let customer = await Customer.findOne({ where: { mobile, branch_id } });
        if (customer) {
            await customer.update({ name, mobile, branch_id }, { transaction: extras.transaction });
        }
        else {
            customer = await Customer.create({ name, mobile, branch_id }, { transaction: extras.transaction, });
        }

        return customer;
    }

    /**
     * 
     * @param {{
     * total:number
     * customer_id:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras
     */
    static async addRewards({ customer_id, branch_id, total }, extras) {
        Validation.nullParameters([customer_id, branch_id, total]);

        const branchSettings = await BranchService.getBranchSettings(branch_id);
        if (!branchSettings.reward.status) {
            return;
        }

        const customer = await findModelOrThrow({ customer_id, branch_id }, Customer, {
            transaction: extras.transaction,
        });
        const reward = parseFloat(total) * branchSettings.reward.value / 100;

        Validation.isTrue(reward > 0);

        await customer.increment('rewards', {
            by: reward,
            transaction: extras.transaction,
        });

        await customer.reload({ transaction: extras.transaction });

        return { reward, customer };
    }

    /**
     * 
     * @param {{
     * amount:number
     * customer_id:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras
     */
    static async useRewards({ customer_id, branch_id, amount }, extras) {
        Validation.nullParameters([customer_id, branch_id, amount]);

        const customer = await findModelOrThrow({ customer_id, branch_id }, Customer, {
            transaction: extras.transaction,
        });

        Validation.isTrue(amount > 0);
        Validation.isTrue(!(customer.rewards < amount), {
            message: "Insufficient rewards",
        });

        await customer.increment('rewards', {
            by: -amount,
            transaction: extras.transaction,
        });

        return customer;
    }

    /**
     * 
     * @param {string} branch_id 
     */
    static async findWalkInCustomer(branch_id) {
        /** @type {TCustomer} */
        const category = await findModelOrThrow({
            branch_id,
            name: "Walk In",
        }, Customer);

        return category;
    }
}

module.exports = CustomerService;