/**
 * 
 * @typedef {Object} TTransfer
 * @property {string} transfer_id
 * @property {string} transfer_no
 * @property {TTransferType} type
 * @property {string} transfer_to
 * @property {string} transfer_from
 * @property {Date} transferred_at
 * @property {TTransferStatus} status
 * @property {TTransferItem[]} transferItems
 */

/**
 * 
 * @typedef {Object} TTransferItem
 * @property {string} transfer_item_id
 * @property {string} transfer_id
 * @property {TTransfer} transfer
 * @property {number} quantity
 * @property {string} batch_id
 * @property {TBatch} batch
 * @property {string} transferred_as
 * @property {TBatch} transferredAs
 * @property {Date} transferred_at
 */