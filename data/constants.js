const LANGUAGES = {
    ENGLISH: 'ENGLISH',
    FRENCH: 'FRENCH',
    SPANISH: 'SPANISH',
    CHINESE: 'CHINESE',
    ARABIC: 'ARABIC',
}
module.exports.LANGUAGES = LANGUAGES;
/** @typedef {keyof typeof LANGUAGES} TLanguage */

const INVOICE_TYPES = {
    CUSTOMER: "CUSTOMER",
    VENDOR: "VENDOR",
}
module.exports.INVOICE_TYPES = INVOICE_TYPES;
/** @typedef {keyof typeof INVOICE_TYPES} TInvoiceType */

const CATEGORY_TYPES = {
    MAIN: "MAIN",
    ITEM: "ITEM",
    CUSTOM: "CUSTOM",
    OPTION: "OPTION"
}
module.exports.CATEGORY_TYPES = CATEGORY_TYPES;
/** @typedef {keyof typeof CATEGORY_TYPES} TCategoryType */

const ITEM_TYPES = {
    GENERIC: "GENERIC",
    CUSTOM: "CUSTOM",
}
module.exports.ITEM_TYPES = ITEM_TYPES;
/** @typedef {keyof typeof ITEM_TYPES} TItemType */

const MEASURE_UNITS = {
    PCS: "PCS",
    KG: "KG",
}
module.exports.MEASURE_UNITS = MEASURE_UNITS;
/** @typedef {keyof typeof MEASURE_UNITS} TUnit */

const INVOICE_STATUSES = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    DELIVERED: "DELIVERED",
    RETURNED: "RETURNED",
}
module.exports.INVOICE_STATUSES = INVOICE_STATUSES;
/** @typedef {keyof typeof INVOICE_STATUSES} TInvoiceStatus */

const KITCHEN_ORDER_STATUSES = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED",
    DELIVERED: "DELIVERED",
}
module.exports.KITCHEN_ORDER_STATUSES = KITCHEN_ORDER_STATUSES;
/** @typedef {keyof typeof KITCHEN_ORDER_STATUSES} TKitchenOrderStatus */

const KITCHEN_ORDER_TYPES = {
    INVOICE: "INVOICE",
    STOCK: "STOCK",
}
module.exports.KITCHEN_ORDER_TYPES = KITCHEN_ORDER_TYPES;
/** @typedef {keyof typeof KITCHEN_ORDER_TYPES} TKitchenOrderType */

const DISCOUNT_TYPES = {
    PERCENTAGE: "PERCENTAGE",
    FIXED: "FIXED",
}
module.exports.DISCOUNT_TYPES = DISCOUNT_TYPES;
/** @typedef {keyof typeof DISCOUNT_TYPES} TDiscountType */

const TRANSACTION_ENTITY_TYPES = {
    INVOICE: "INVOICE",
    SALARY: "SALARY",
    EXPENSE: "EXPENSE",
}
module.exports.TRANSACTION_ENTITY_TYPES = TRANSACTION_ENTITY_TYPES;
/** @typedef {keyof typeof TRANSACTION_ENTITY_TYPES} TTransactionEntityType */

const TRANSACTION_REASONS = {
    INVOICE_ADVANCE: "INVOICE_ADVANCE",
    INVOICE_PAYMENT: "INVOICE_PAYMENT",
    INVOICE_REFUND: "INVOICE_REFUND",
    SALARY: "SALARY",
    EXPENSE: "EXPENSE",
}
module.exports.TRANSACTION_REASONS = TRANSACTION_REASONS;
/** @typedef {keyof typeof TRANSACTION_REASONS} TTransactionReason */

const TRANSACTION_STATUSES = {
    COMPLETED: "COMPLETED",
    PENDING: "PENDING",
}
module.exports.TRANSACTION_STATUSES = TRANSACTION_STATUSES;
/** @typedef {keyof typeof TRANSACTION_STATUSES} TTransactionStatus */

const TRANSACTION_METHODS = {
    CASH: "CASH",
    CARD: "CARD",
    BANK: "BANK",
    REWARD: "REWARD",
}
module.exports.TRANSACTION_METHODS = TRANSACTION_METHODS;
/** @typedef {keyof typeof TRANSACTION_METHODS} TTransactionMethod */

const VENDOR_STATUSES = {
    ACTIVE: "ACTIVE",
    IN_ACTIVE: "IN_ACTIVE",
}
module.exports.VENDOR_STATUSES = VENDOR_STATUSES;
/** @typedef {keyof typeof VENDOR_STATUSES} TVendorStatus */

const SIGN = {
    POSITIVE: "POSITIVE",
    NEGATIVE: "NEGATIVE",
}
module.exports.SIGN = SIGN;
/** @typedef {keyof typeof SIGN} TSign */

const TRANSFER_TYPES = {
    KITCHEN: "KITCHEN",
    BRANCH: "BRANCH",
}
module.exports.TRANSFER_TYPES = TRANSFER_TYPES;
/** @typedef {keyof typeof TRANSFER_TYPES} TTransferType */

const TRANSFER_STATUSES = {
    PENDING: "PENDING",
    REJECTED: "REJECTED",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    TRANSFERRED: "TRANSFERRED",
}
module.exports.TRANSFER_STATUSES = TRANSFER_STATUSES;
/** @typedef {keyof typeof TRANSFER_STATUSES} TTransferStatus */

const USER_STATUSES = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
}
module.exports.USER_STATUSES = USER_STATUSES;
/** @typedef {keyof typeof USER_STATUSES} TUserStatus */

const WEEKDAYS = {
    MONDAY: "MONDAY",
    TUESDAY: "TUESDAY",
    WEDNESDAY: "WEDNESDAY",
    THURSDAY: "THURSDAY",
    FRIDAY: "FRIDAY",
    SATURDAY: "SATURDAY",
    SUNDAY: "SUNDAY",
}
module.exports.WEEKDAYS = WEEKDAYS;
/** @typedef {keyof typeof WEEKDAYS} TWeekday */

const HOLIDAY_TYPES = {
    WEEKLY: "WEEKLY",
    CUSTOM: "CUSTOM",
}
module.exports.HOLIDAY_TYPES = HOLIDAY_TYPES;
/** @typedef {keyof typeof HOLIDAY_TYPES} THolidayType */

const HOLIDAY_LEAVE_TYPES = {
    HALF: "HALF",
    FULL: "FULL",
}
module.exports.HOLIDAY_LEAVE_TYPES = HOLIDAY_LEAVE_TYPES;
/** @typedef {keyof typeof HOLIDAY_LEAVE_TYPES} THolidayLeaveType */

const ATTENDANCE_STATUSES = {
    PRESENT: "PRESENT",
    HALF_DAY: "HALF_DAY",
    LEAVE: "LEAVE",
    CUSTOM: "CUSTOM",
}
module.exports.ATTENDANCE_STATUSES = ATTENDANCE_STATUSES;
/** @typedef {keyof typeof ATTENDANCE_STATUSES} TAttendanceStatus */

const LEAVE_REQUEST_TYPES = {
    HALF: "HALF",
    FULL: "FULL",
    CUSTOM: "CUSTOM",
}
module.exports.LEAVE_REQUEST_TYPES = LEAVE_REQUEST_TYPES;
/** @typedef {keyof typeof LEAVE_REQUEST_TYPES} TLeaveRequestType */

const LEAVE_REQUEST_STATUSES = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
}
module.exports.LEAVE_REQUEST_STATUSES = LEAVE_REQUEST_STATUSES;
/** @typedef {keyof typeof LEAVE_REQUEST_STATUSES} TLeaveRequestStatus */

const LEAVE_REQUEST_PURPOSES = {
    SICK: "SICK",
    MATERNITY: "MATERNITY",
}
module.exports.LEAVE_REQUEST_PURPOSES = LEAVE_REQUEST_PURPOSES;
/** @typedef {keyof typeof LEAVE_REQUEST_PURPOSES} TLeaveRequestPurpose */

const SCOPE_TYPES = {
    PRIVATE: "PRIVATE",
    PUBLIC: "PUBLIC",
}
module.exports.SCOPE_TYPES = SCOPE_TYPES;
/** @typedef {keyof typeof SCOPE_TYPES} TScopeType */

const INVOICE_ITEM_STATUS = {
    NORMAL: "NORMAL",
    FULL_RETURN: "FULL_RETURN",
    PARTIAL_RETURN: "PARTIAL_RETURN",
}
module.exports.INVOICE_ITEM_STATUS = INVOICE_ITEM_STATUS;
/** @typedef {keyof typeof INVOICE_ITEM_STATUS} TInvoiceItemStatus */

const FROZEN_BATCH_TYPE = {
    INVOICE: "INVOICE",
    TRANSFER: "TRANSFER",
}
module.exports.FROZEN_BATCH_TYPE = FROZEN_BATCH_TYPE;
/** @typedef {keyof typeof FROZEN_BATCH_TYPE} TFrozenBatchType */

const TEMPLATE_TYPES = {
    NOTIFICATION: "NOTIFICATION",
    SMS: "SMS",
}
module.exports.TEMPLATE_TYPES = TEMPLATE_TYPES;
/** @typedef {keyof typeof TEMPLATE_TYPES} TTemplateType */

const BRANCH_CATEGORIES = ["POS_MENU", "UNCATEGORIZED", "CUSTOM_PRESET"];
module.exports.BRANCH_CATEGORIES = BRANCH_CATEGORIES;


//GOWIN

const GENERAL_TYPES = {
    REGION:"REGION",
    STATE:"STATE",
    DESIGNATION:"DESIGNATION",
    TEAM:"TEAM",
    PARTNER_TYPE:"PARTNER_TYPE",
    INSURER:"INSURER",
    MAKE:"MAKE",
}

module.exports.GENERAL_TYPES = GENERAL_TYPES
/** @typedef {keyof typeof GENERAL_TYPES} TGeneralTypes */