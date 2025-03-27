/**
 * 
 * @typedef {Object} TBranch
 * @property {string} branch_id
 * @property {string} name
 * @property {string} code
 * @property {string[]} contact
 * @property {string} address
 * @property {TBranchSetting} settings
 * @property {{[key:string]:TCategory}} mainCategories
 */

/**
 * 
 * @typedef {Object} TBranchSetting
 * @property {TRewardSetting} reward
 */

/**
 * 
 * @typedef {Object} TRewardSetting
 * @property {boolean} status
 * @property {number} value
 */