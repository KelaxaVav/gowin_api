const {    ExpensesEntry, ExpensesCategory } = require("../models");
const { findModelOrThrow, Validation } = require("../utils/validation");

class ExpensesEntryService {
    /**
     * 
     * @param {{
     * name:string
     * is_active:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createExpensesEntry({  entry_date,expenses_id,expenses_category_id,amount,taxes,is_active }, extras) {
        Validation.nullParameters([entry_date,expenses_id,expenses_category_id]);

        const expense = await ExpensesEntry.create({
            entry_date,
            expenses_id,
            expenses_category_id,
            amount,
            taxes,
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
   static async updateExpensesEntry({ expenses_entry_id,entry_date,expenses_id,expenses_category_id,amount,taxes,is_active }, extras) {
        Validation.nullParameters([expenses_entry_id]);

       const expenses = await findModelOrThrow({ expenses_entry_id }, ExpensesEntry, {
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
        entry_date,
        expenses_id,
        expenses_category_id,
        amount,
        taxes,
        is_active
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
    static async deleteExpensesEntry({ expenses_entry_id }, extras) {
        const type = await findModelOrThrow({ expenses_entry_id }, ExpensesEntry);

        await type.destroy({ transaction: extras.transaction });
    }
}

module.exports = ExpensesEntryService;