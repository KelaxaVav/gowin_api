/**
 * 
 * @typedef {Object} TKitchenOrder
 * @property {string} kitchen_order_id
 * @property {TKitchenOrderType} type
 * @property {string} entity_id
 * @property {TInvoiceStatus} status
 * @property {TKitchenOrderItem|undefined} kitchenOrderItem
 * @property {TInvoiceItem|undefined} invoiceItem
 */

/**
 * 
 * @typedef {Object} TKitchenOrderItem
 * @property {'kitchen_order_item'} tType
 * @property {string} kitchen_order_item_id
 * @property {string} item_id
 * @property {string} branch_id
 * @property {number} price
 * @property {number} quantity
 * @property {Date} delivery_at
 * @property {TKitchenOrder} kitchenOrder
 * @property {TItem} item
 */