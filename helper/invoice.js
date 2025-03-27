const { DISCOUNT_TYPES, TRANSACTION_REASONS } = require("../data/constants");

/**
 * 
 * @param {number} sub_total 
 * @param {TDiscountType} discount_type 
 * @param {number} discount_value 
 */
function calculateDiscountAmount(sub_total, discount_type, discount_value) {
    let discount = 0;

    if (discount_type == DISCOUNT_TYPES.FIXED) {
        discount = discount_value;
    } else if (DISCOUNT_TYPES.PERCENTAGE) {
        discount = (sub_total * discount_value) / 100;
    }

    const total = sub_total - discount;

    return { discount, total };
}

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
        if (transaction.reason == TRANSACTION_REASONS.INVOICE_REFUND) {
            total -= transaction.amount;
        } else {
            total += transaction.amount;
        }

        return total;
    }, 0);

    return { paid };
}

/** @param {TInvoiceItem[]} invoiceItems */
const setInvoiceItemTotal = (invoiceItems) => {
    let invoiceSubTotal = 0;
    let invoiceDiscountTotal = 0;
    if (!invoiceItems?.length) {
        return {
            sub_total: invoiceSubTotal,
            discount_total: invoiceDiscountTotal,
        }
    }

    invoiceItems.forEach(iItem => {
        const { price, quantity, discount_type, discount_value } = iItem;
        const sub_total = price * quantity;
        const { discount, total } = calculateDiscountAmount(sub_total, discount_type, discount_value);

        invoiceSubTotal += sub_total;
        invoiceDiscountTotal += discount;

        iItem.dataValues.discount = discount;
        iItem.dataValues.sub_total = sub_total;
        iItem.dataValues.total = total;
    });

    return {
        sub_total: invoiceSubTotal,
        discount_total: invoiceDiscountTotal,
    };
}

/** @param {TInvoice[]} invoices */
const invoiceAfterFind = (invoices) => {
    invoices.forEach(invoice => {
        const { invoiceItems, transactions, discount_type, discount_value } = invoice;

        const { sub_total, discount_total } = setInvoiceItemTotal(invoiceItems);
        const { discount, total } = calculateDiscountAmount(sub_total, discount_type, discount_value);
        const { paid } = calculateTransactionTotalPaid(transactions);

        const gross_total = sub_total - discount_total;
        const balance = paid ? total - paid : total;

        invoice.dataValues.sub_total = sub_total;
        invoice.sub_total = sub_total;
        invoice.dataValues.discount_total = discount_total;
        invoice.discount_total = discount_total;
        invoice.dataValues.gross_total = gross_total;
        invoice.gross_total = gross_total;
        invoice.dataValues.discount = discount;
        invoice.discount = discount;
        invoice.dataValues.total = total;
        invoice.total = total;
        invoice.dataValues.paid = paid;
        invoice.paid = paid;
        invoice.dataValues.balance = balance;
        invoice.balance = balance;
    });
}

module.exports = {
    invoiceAfterFind,
};