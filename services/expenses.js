const {    Expenses, ExpensesCategory } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class ExpensesService {
    /**
     * 
     * @param {{
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createType({  name,expenses_category_id, is_active }, extras) {
        Validation.nullParameters([name,expenses_category_id]);

        const expense = await Expenses.create({
            name,
            expenses_category_id,
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
   static async updateTypes({ expenses_id,expenses_category_id, name, is_active }, extras) {
        Validation.nullParameters([expenses_id]);

       const expenses = await findModelOrThrow({ expenses_id }, Expenses, {
           transaction: extras.transaction,
           lock: true,
           include:[
            {
                model:ExpensesCategory,
                as:'expenses_category',
            }
           ]
       });

       await expenses.update({
        name,
        expenses_category_id,
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
    static async deleteType({ expenses_id }, extras) {
        const type = await findModelOrThrow({ expenses_id }, Expenses);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = ExpensesService;