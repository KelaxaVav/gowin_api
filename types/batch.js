/**
 * 
 * @typedef {Object} TBatch
 * @property {string} batch_id
 * @property {string} item_id
 * @property {TItem} item
 * @property {TSign} sign
 * @property {number} quantity
 * @property {number} price
 * @property {number|undefined} price_min
 */

/**
 * 
 * @typedef {Object} TFrozenBatch
 * @property {string} batch_id
 * @property {string} owner_id
 * @property {TFrozenBatchType} type
 * @property {number} quantity
 */