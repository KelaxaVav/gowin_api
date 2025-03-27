const { TRANSACTION_ENTITY_TYPES, TRANSACTION_REASONS, TRANSACTION_METHODS } = require("../data/constants");
const { Transaction, Invoice, InvoiceItem, Expense } = require("../models");
const AppError = require("../utils/appError");
const { Validation, findModelOrThrow } = require("../utils/validation");

class TransactionService {
    /**
     * 
     * @param {{
     * entity_id:string
     * entity_type:TTransactionEntityType
     * branch_id:string
     * reason:TTransactionReason
     * date:Date
     * amount:number
     * method:TTransactionMethod
     * status:TTransactionStatus
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createTransaction({ entity_id, entity_type, branch_id, date, method, amount, reason, status }, extras) {
        Validation.nullParameters([entity_id, entity_type, date, amount, reason]);
        Validation.isTrue(Object.keys(TRANSACTION_ENTITY_TYPES).includes(entity_type));
        method && Validation.isTrue(Object.keys(TRANSACTION_METHODS).includes(method));
        amount = parseFloat(amount);
        Validation.isTrue(amount > 0);

        if (entity_type == TRANSACTION_ENTITY_TYPES.INVOICE) {
            /** @type {TInvoice} */
            const invoice = await findModelOrThrow({ invoice_id: entity_id }, Invoice, {
                include: [
                    {
                        model: InvoiceItem,
                        as: 'invoiceItems',
                        attributes: ['price', 'quantity', 'return_quantity', 'discount_type', 'discount_value'],
                    },
                    {
                        model: Transaction,
                        as: 'transactions',
                    }
                ],
                transaction: extras.transaction,
            });

            Validation.authority(branch_id, invoice.branch_id);

            if (reason == TRANSACTION_REASONS.INVOICE_PAYMENT) {
                if (amount > invoice.balance) {
                    throw new AppError("Transaction amount is greater than balance amount.")
                }
            } else if (reason == TRANSACTION_REASONS.INVOICE_REFUND) {
                if (amount > -invoice.balance) {
                    throw new AppError("Transaction amount is greater than balance amount.")
                }
            }

        } else if (entity_type == TRANSACTION_ENTITY_TYPES.EXPENSE) {
            Validation.isTrue(reason == TRANSACTION_REASONS.EXPENSE);

            /** @type {TExpense} */
            const expense = await findModelOrThrow({ expense_id: entity_id }, Expense, {
                include: [
                    {
                        model: Transaction,
                        as: 'transactions',
                    }
                ],
                transaction: extras.transaction,
            });

            Validation.authority(branch_id, expense.branch_id);

            if (amount > expense.balance) {
                throw new AppError("Transaction amount is greater than balance amount.")
            }
        } else {
            Validation.isTrue(0);
        }

        const transaction = await Transaction.create({
            entity_id,
            entity_type,
            branch_id,
            reason,
            date,
            amount,
            method,
            status,
        }, { transaction: extras.transaction });

        return transaction;
    }

    /**
     * 
     * @param {{
     * transaction_id:string
     * branch_id:string
     * reason:TTransactionReason
     * date:Date
     * amount:number
     * method:TTransactionMethod
     * status:TTransactionStatus
     * }} param0 
     * @param {Extras} extras
     */
    static async updateTransaction({ transaction_id, branch_id, method, amount, date, reason, status }, extras) {
        Validation.nullParameters([transaction_id, date, amount]);
        reason && Validation.isTrue(Object.keys(TRANSACTION_REASONS).includes(reason));
        method && Validation.isTrue(Object.keys(TRANSACTION_METHODS).includes(method));
        amount = parseFloat(amount);
        Validation.isTrue(amount > 0);

        /** @type {TTransaction} */
        const transaction = await findModelOrThrow({ transaction_id }, Transaction, {
            transaction: extras.transaction,
        });

        Validation.authority(branch_id, transaction.branch_id);

        if (transaction.entity_type == TRANSACTION_ENTITY_TYPES.INVOICE) {
            Validation.nullParameters([reason]);

            /** @type {TInvoice} */
            const invoice = await findModelOrThrow({ invoice_id: transaction.entity_id }, Invoice, {
                include: [
                    {
                        model: InvoiceItem,
                        as: 'invoiceItems',
                        attributes: ['price', 'quantity', 'return_quantity', 'discount_type', 'discount_value'],
                    },
                    {
                        model: Transaction,
                        as: 'transactions',
                    }
                ],
                transaction: extras.transaction,
            });


            // if (reason == TRANSACTION_REASONS.INVOICE_PAYMENT) {
            if (amount > invoice.balance + transaction.amount) {
                throw new AppError("Transaction amount is greater than balance amount.")
            }
            // } else if (reason == TRANSACTION_REASONS.INVOICE_REFUND) {
            //     if (amount > -invoice.balance + transaction.amount) {
            //         throw new AppError("Transaction amount is greater than balance amount.")
            //     }
            // }

        } else if (transaction.entity_type == TRANSACTION_ENTITY_TYPES.SALARY) {
            /** @type {TExpense} */
            const expense = await findModelOrThrow({ expense_id: entity_id }, Expense, {
                include: [
                    {
                        model: Transaction,
                        as: 'transactions',
                    }
                ],
                transaction: extras.transaction,
            });

            if (amount > expense.balance) {
                throw new AppError("Transaction amount is greater than balance amount.")
            }
        }

        await transaction.update({
            reason,
            date,
            amount,
            status,
            method,
        }, { transaction: extras.transaction });

        return transaction;
    }

    /**
     * 
     * @param {{
     * transaction_id:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteTransaction({ transaction_id, branch_id }, extras) {
        /** @type {TTransaction} */
        const transaction = await findModelOrThrow({ transaction_id }, Transaction, {
            throwOnDeleted: true,
            messageOnDeleted: "Transaction is already deleted",
        });

        Validation.authority(branch_id, transaction.branch_id);

        await transaction.destroy({ transaction: extras.transaction });
    }
}

module.exports = TransactionService;
