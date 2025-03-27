const {    ExpensesCategory } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class ExpensesCategoryService {
    /**
     * 
     * @param {{
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createType({  name, is_active }, extras) {
        Validation.nullParameters([name]);

        const expense = await ExpensesCategory.create({
            name,
            is_active,
        }, { transaction: extras.transaction });

        return expense;
    }

    /**
     * 
     * @param {{
    * expense_id:string
    * name:string
    * is_active:boolean
    * }} param0 
    * @param {Extras} extras
    */
   static async updateTypes({ expenses_category_id, name, is_active }, extras) {
        Validation.nullParameters([expenses_category_id]);

       const expenses = await findModelOrThrow({ expenses_category_id }, ExpensesCategory, {
           transaction: extras.transaction,
           lock: true,
       });

       await expenses.update({
        name,
        is_active,
       }, { transaction: extras.transaction });

       return expenses;
   }

    /**
     * 
     * @param {{
     *  type_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteType({ expenses_category_id }, extras) {
        const type = await findModelOrThrow({ expenses_category_id }, ExpensesCategory);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = ExpensesCategoryService;