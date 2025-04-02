const ROLES = {
    BRANCH_ADMIN: 'BRANCH_ADMIN',
    BRANCH_MANAGER: 'BRANCH_MANAGER',
    RELATIONSHIP_MANAGER: 'RELATIONSHIP_MANAGER',
}
module.exports.ROLES = ROLES;
/** @typedef {keyof typeof ROLES} TRoleName */

const TEMPLATE_TYPES = {
    NOTIFICATION: "NOTIFICATION",
    SMS: "SMS",
}
module.exports.TEMPLATE_TYPES = TEMPLATE_TYPES;
/** @typedef {keyof typeof TEMPLATE_TYPES} TTemplateType */

//GOWIN

const GENERAL_TYPES = {
    REGION: "REGION",
    STATE: "STATE",
    DESIGNATION: "DESIGNATION",
    TEAM: "TEAM",
    PARTNER_TYPE: "PARTNER_TYPE",
    INSURER: "INSURER",
    MAKE: "MAKE",
}

module.exports.GENERAL_TYPES = GENERAL_TYPES
/** @typedef {keyof typeof GENERAL_TYPES} TGeneralTypes */