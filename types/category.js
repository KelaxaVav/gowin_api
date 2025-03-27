/**
 * 
 * @typedef {Object} TCategory
 * @property {string} category_id
 * @property {string} name
 * @property {TCategoryType} type
 * @property {number} price
 * @property {boolean} visibility
 * @property {string|undefined} parent_id
 * @property {string} branch_id
 * @property {string[]} children 
 * @property {TItem[]} items
 * @property {TCustomCategory[]} options
 */

/**
 * 
 * @typedef {Object} TMainCategory
 * @property {string} category_id
 * @property {string} name
 * @property {'MAIN'} type
 * @property {string} branch_id
*/

/**
 * 
 * @typedef {Object} TItemCategory
 * @property {string} category_id
 * @property {string} name
 * @property {'ITEM'} type
 * @property {boolean} visibility
 * @property {string|undefined} parent_id
 * @property {string} branch_id
*/

/**
 * 
 * @typedef {Object} TCustomCategory
 * @property {string} category_id
 * @property {string} name
 * @property {'CUSTOM'} type
 * @property {number} price
 * @property {boolean} visibility
 * @property {string|undefined} parent_id
 * @property {string} branch_id
 * @property {string[]} children
 */

/**
 * 
 * @typedef {Object} TOptionCategory
 * @property {string} category_id
 * @property {string} name
 * @property {'OPTION'} type
 * @property {number} price
 * @property {boolean} visibility
 * @property {string} branch_id
 */