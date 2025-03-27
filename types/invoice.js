/**
 * 
 * @typedef {Object} TInvoice
 * @property {string} invoice_id
 * @property {string} invoice_no
 * @property {Date} date
 * @property {TInvoiceType} type
 * @property {string} party_id
 * @property {string} branch_id
 * @property {number} sub_total
 * @property {number} discount
 * @property {number} total
 * @property {number} paid
 * @property {number} balance
 * @property {TInvoiceItem[]} invoiceItems
 * @property {TDiscountType} discount_type
 * @property {number} discount_value
 * @property {Date} delivery_at
 * @property {TInvoiceStatus} status
 * @property {TTransaction[]} transactions
 * @property {TCustomer} customer
 * @property {TBranch} branch
 */

/**
 * 
 * @typedef {Object} TInvoiceItem
 * @property {'invoice_item'} tType
 * @property {string} invoice_item_id
 * @property {string} invoice_id
 * @property {TInvoice} invoice
 * @property {TItemType} type
 * @property {number} price
 * @property {number} quantity
 * @property {number} return_quantity
 * @property {string} batch_id
 * @property {TBatch} batch
 * @property {TDiscountType} discount_type
 * @property {number} discount_value
 * @property {Date} delivery_at
 * @property {TInvoiceItemStatus} status
 * @property {number} sub_total
 * @property {number} discount
 * @property {number} total
 * @property {TInvoiceItemData} data
 * @property {Object|undefined} customItem
 * @property {string|undefined} name
 * @property {string|undefined} unit
 * @property {string|undefined} item_id
 * @property {number|undefined} category_id
 * @property {TKitchenOrder} kitchenOrder
 */

/**
 * 
 * @typedef {Object} TInvoiceItemData
 * @property {string} message
 * @property {string} image
 */