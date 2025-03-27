/**
 * 
 * @param {TTransaction[]} transactions 
 */
function calculateTransactionTotalPaid(transactions) {
    let paid = 0;
    if (!transactions?.length) {
        return { paid }
    }

    paid = transactions.reduce((total, transaction) => {
        total += transaction.amount;

        return total;
    }, 0);

    return { paid };
}

/** @param {TExpense[]} expenses */
const expenseAfterFind = (expenses) => {
    expenses.forEach(expense => {
        const { amount, transactions } = expense;

        const { paid } = calculateTransactionTotalPaid(transactions);

        expense.dataValues.paid = paid;
        expense.paid = paid;
        expense.dataValues.balance = paid ? amount - paid : amount;
        expense.balance = paid ? amount - paid : amount;
    });
}

module.exports = {
    expenseAfterFind,
};