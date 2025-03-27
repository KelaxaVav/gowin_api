const { INVOICE_TYPES, INVOICE_STATUSES, KITCHEN_ORDER_STATUSES, ITEM_TYPES, KITCHEN_ORDER_TYPES, FROZEN_BATCH_TYPE } = require("../data/constants");
const { Batch, Invoice, Customer, Vendor, InvoiceItem, Item, KitchenOrder, Branch } = require("../models");
const { Validation, findModelOrThrow } = require("../utils/validation");
const CustomerService = require("../services/customer");
const CommonService = require("./common");
const InvoiceItemService = require("./invoiceItem");
const { firstLetterCapital, STATUS_CODE } = require("../utils/utility");
const BatchService = require("./batch");
const KitchenService = require("./kitchen");
const AppError = require("../utils/appError");
const { createUniqueNo } = require(".");
const { sendInvoiceDeliveredSMS, sendOrderPlacedSMS } = require("../helper/sms");

class InvoiceService {
    static async createInvoiceNo(branch_id) {
        const branch = await findModelOrThrow({ branch_id }, Branch);
        const invoice_no = await createUniqueNo(Invoice, { prefix: branch.code.toUpperCase() }, { branch_id });

        return invoice_no;
    }

    /**
     * 
     * @param {{
     * invoiceItems:TInvoiceItem[]
     * date:Date
     * party_id:string
     * name:string
     * mobile:string
     * discount_type:string
     * discount_value:number
     * delivery_at:Date
     * branch_id:string
     * type:TInvoiceType
     * status:TInvoiceStatus
     * data:any
     * }} param0 
     * @param {Extras} extras
     */
    static async createInvoice({ name, mobile, date, party_id, discount_type, discount_value,
        delivery_at, type, branch_id, invoiceItems, status, data }, extras) {
        Validation.emptyArrayParameters(invoiceItems);
        Validation.nullParameters([type]);
        Validation.timeParameters([date]);
        Validation.isTrue(Object.keys(INVOICE_TYPES).includes(type));
        Validation.isTrue([INVOICE_STATUSES.PENDING, INVOICE_STATUSES.CONFIRMED].includes(status));
        CommonService.validateDiscount(discount_type, discount_value);

        if (type == INVOICE_TYPES.CUSTOMER) {
            if (party_id) {
                await findModelOrThrow({ customer_id: party_id, branch_id }, Customer);
            }
            else if (mobile) {
                const customer = await CustomerService.createCustomer({ name, mobile, branch_id }, extras);
                party_id = customer.customer_id;
            }
            else {
                const customer = await CustomerService.findWalkInCustomer(branch_id);
                party_id = customer.customer_id;
            }
        } else if (type == INVOICE_TYPES.VENDOR) {
            await findModelOrThrow({ vendor_id: party_id }, Vendor);
        }

        const invoice_no = await this.createInvoiceNo(branch_id);
        const invoice = await Invoice.create({
            date,
            invoice_no,
            party_id,
            discount_type,
            discount_value,
            delivery_at,
            type,
            branch_id,
            data,
        }, { transaction: extras.transaction });

        await InvoiceItemService.createInvoiceItems({ branch_id, invoice_id: invoice.invoice_id, type }, invoiceItems, extras);

        return invoice;
    }

    /**
     * 
     * @param {{
     * invoice_id:string
     * invoiceItems:TInvoiceItem[]
     * branch_id:string
     * date:Date
     * party_id:string
     * name:string
     * mobile:string
     * discount_type:string
     * discount_value:number
     * delivery_at:Date
     * }} param0 
     * @param {Extras} extras
     */
    static async updateInvoice({ invoice_id, name, mobile, date, party_id, discount_type,
        discount_value, delivery_at, branch_id, invoiceItems }, extras) {
        Validation.emptyArrayParameters(invoiceItems);
        CommonService.validateDiscount(discount_type, discount_value);
        Validation.timeParameters([date]);

        /** @type {TInvoice} */
        const invoice = await findModelOrThrow({ invoice_id }, Invoice, {
            transaction: extras.transaction,
            lock: true,
            include: [
                {
                    model: InvoiceItem,
                    as: 'invoiceItems',
                    include: [
                        {
                            model: Batch,
                            as: 'batch',
                            include: [
                                {
                                    model: Item,
                                    as: 'item',
                                },
                            ],
                        },
                        {
                            model: KitchenOrder,
                            as: 'kitchenOrder',
                        }
                    ],
                },
            ],
        });

        Validation.authority(branch_id, invoice.branch_id);
        Validation.isTrue(invoice.status == INVOICE_STATUSES.PENDING, {
            message: `${firstLetterCapital(invoice.status)} invoice cannot be updated`
        });

        if (invoice.type == INVOICE_TYPES.CUSTOMER) {
            if (party_id) {
                await findModelOrThrow({ customer_id: party_id, branch_id }, Customer);
            } else {
                const customer = await CustomerService.createCustomer({ name, mobile, branch_id }, extras);
                party_id = customer.customer_id;
            }
        } else if (invoice.type == INVOICE_TYPES.VENDOR) {
            await findModelOrThrow({ vendor_id: party_id }, Vendor);
        }

        await invoice.update({
            date,
            party_id,
            discount_type,
            discount_value,
            delivery_at,
        }, { transaction: extras.transaction });

        const updatedInvoiceItemIds = [];
        const updatedInvoiceItemData = invoiceItems.reduce((invoiceItemData, iItem) => {
            if (iItem.invoice_item_id) {
                invoiceItemData[iItem.invoice_item_id] = iItem;
                updatedInvoiceItemIds.push(iItem.invoice_item_id);
            }
            return invoiceItemData;
        }, {});

        const newInvoiceItems = invoiceItems.filter(iItem => !iItem.invoice_item_id);
        const updatedInvoiceItems = invoice.invoiceItems.filter(iItem => updatedInvoiceItemIds.includes(iItem.invoice_item_id));
        const deletedInvoiceItems = invoice.invoiceItems.filter(iItem => !updatedInvoiceItemIds.includes(iItem.invoice_item_id));

        const invoiceItemIds = invoice.invoiceItems.map(iItem => iItem.invoice_item_id);
        const invalidInvoiceItemIds = updatedInvoiceItemIds.filter(uIItemId => !invoiceItemIds.includes(uIItemId));
        Validation.isTrue(!invalidInvoiceItemIds.length);

        await InvoiceItemService.createInvoiceItems({ type: invoice.type, branch_id, invoice_id: invoice.invoice_id, }, newInvoiceItems, extras);
        await InvoiceItemService.updateInvoiceItems({ type: invoice.type, branch_id }, updatedInvoiceItems, updatedInvoiceItemData, extras);
        await InvoiceItemService.deleteInvoiceItems({ type: invoice.type }, deletedInvoiceItems, extras);

        return invoice;
    }

    /**
     * 
     * @param {{
     * invoice_id:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteInvoice({ invoice_id, branch_id }, extras) {
        /** @type {TInvoice} */
        const invoice = await findModelOrThrow({ invoice_id }, Invoice, {
            throwOnDeleted: true,
            messageOnDeleted: "Invoice is already deleted",
        });

        Validation.authority(branch_id, invoice.branch_id);
        Validation.isTrue(invoice.status == INVOICE_STATUSES.PENDING, {
            message: `${firstLetterCapital(invoice.status)} invoice cannot be deleted`
        });

        await invoice.destroy({ transaction: extras.transaction });
    }

    /**
     * 
     * @param {{
     * branch_id:string
     * invoice_id:string
     * status:TInvoiceStatus
     * isServiceCall:boolean
     * }} param0 
     * @param {Extras} extras
     */
    static async updateInvoiceStatus({ branch_id, invoice_id, status, isServiceCall = false }, extras) {
        /** @type {TInvoice} */
        const invoice = await findModelOrThrow({ invoice_id }, Invoice, {
            transaction: extras.transaction,
            lock: true,
            include: [
                {
                    model: InvoiceItem,
                    as: 'invoiceItems',
                    include: [
                        {
                            model: Batch,
                            as: 'batch',
                            include: [
                                {
                                    model: Item,
                                    as: 'item',
                                },
                            ],
                        },
                        {
                            model: KitchenOrder,
                            as: 'kitchenOrder',
                        },
                    ],
                },
                {
                    model: Customer,
                    as: 'customer',
                },
                {
                    model: Branch,
                    as: 'branch',
                }
            ],
        });

        if (status == invoice.status && !isServiceCall) {
            throw new AppError(`Invoice already ${status.toLowerCase()}`);
        }

        if (isServiceCall && status == INVOICE_STATUSES.PENDING) {
            return;
        }

        Validation.authority(branch_id, invoice.branch_id);
        Validation.isTrue(INVOICE_STATUSES[status]);
        Validation.isTrue(![INVOICE_STATUSES.RETURNED, INVOICE_STATUSES.DELIVERED].includes(invoice.status), {
            message: `Invoice is already ${invoice.status.toLowerCase()}`,
        });

        const orderPlacedSmses = [];
        if (status == INVOICE_STATUSES.CONFIRMED) {
            Validation.isTrue(invoice.status == INVOICE_STATUSES.PENDING, {
                message: `Invoice is already ${invoice.status.toLowerCase()}`,
            });

            if (invoice.type == INVOICE_TYPES.CUSTOMER) {
                const genericInvoiceItems = invoice.invoiceItems.filter(i => i.batch.item.type == ITEM_TYPES.GENERIC);
                await BatchService.freezeBatches(FROZEN_BATCH_TYPE.INVOICE, genericInvoiceItems, extras);

                const customItems = invoice.invoiceItems.filter(i => i.batch.item.type == ITEM_TYPES.CUSTOM);
                const cx = await KitchenService.createKitchenOrders({ type: KITCHEN_ORDER_TYPES.INVOICE }, customItems, extras);

                if (customItems.length) {
                    await invoice.reload({
                        include: [
                            {
                                model: InvoiceItem,
                                as: 'invoiceItems',
                                include: [
                                    {
                                        model: KitchenOrder,
                                        as: 'kitchenOrder',
                                    },
                                ],
                            },
                            {
                                model: Customer,
                                as: 'customer',
                            },
                            {
                                model: Branch,
                                as: 'branch',
                            },
                        ],
                        transaction: extras.transaction,
                    });

                    await Promise.all(invoice.invoiceItems.map(async iItem => {
                        if (iItem.kitchenOrder) {
                            orderPlacedSmses.push({ branch_id, invoice, kitchenOrder: iItem.kitchenOrder });
                        }
                    }));
                }
            }

        } else if ([INVOICE_STATUSES.PENDING, INVOICE_STATUSES.CANCELLED].includes(status)) {
            Validation.isTrue(invoice.status == INVOICE_STATUSES.CONFIRMED, {
                message: `Only confirmed invoices can be changed to ${status.toLowerCase()}`,
            });

            if (invoice.type == INVOICE_TYPES.CUSTOMER) {
                const genericInvoiceItems = invoice.invoiceItems.filter(i => i.batch.item.type == ITEM_TYPES.GENERIC);
                await BatchService.releaseBatches(FROZEN_BATCH_TYPE.INVOICE, genericInvoiceItems, extras);

                const customItems = invoice.invoiceItems.filter(i => i.batch.item.type == ITEM_TYPES.CUSTOM);
                await Promise.all(customItems.map(async cIItem => {
                    await cIItem.kitchenOrder.update({ status: KITCHEN_ORDER_STATUSES.CANCELLED }, { transaction: extras.transaction });
                }));
            }

        } else if (status == INVOICE_STATUSES.COMPLETED) {
            if (invoice.type == INVOICE_TYPES.CUSTOMER) {
                Validation.isTrue(invoice.status == INVOICE_STATUSES.CONFIRMED, {
                    message: `Only confirmed invoices can be changed to ${status.toLowerCase()}`,
                });

                const genericInvoiceItems = invoice.invoiceItems.filter(i => i.batch.item.type == ITEM_TYPES.GENERIC);
                await BatchService.releaseBatches(FROZEN_BATCH_TYPE.INVOICE, genericInvoiceItems, extras);
                await BatchService.deductBatchQuantity(genericInvoiceItems, extras);

                const customItems = invoice.invoiceItems.filter(i => i.batch.item.type == ITEM_TYPES.CUSTOM);
                customItems.forEach(cIItem => {
                    if (cIItem.batch.quantity != 0 || ![KITCHEN_ORDER_STATUSES.COMPLETED, KITCHEN_ORDER_STATUSES.DELIVERED].at(cIItem.kitchenOrder.status)) {
                        const { batch } = cIItem;
                        throw new AppError("Kitchen order of an item is not completed", STATUS_CODE.BAD_REQUEST, {
                            name: batch.item.name,
                            item_id: batch.item_id,
                            batch_id: batch.batch_id,
                            quantity: batch.quantity,
                            order_status: cIItem.kitchenOrder.status,
                        });
                    }
                });
            } else if (invoice.type == INVOICE_TYPES.VENDOR) {
                await BatchService.addBatchQuantity(invoice.invoiceItems, extras);
            }
        } else if (status == INVOICE_STATUSES.DELIVERED) {
            Validation.isTrue(invoice.status == INVOICE_STATUSES.COMPLETED, {
                message: `Only completed invoices can be changed to ${status.toLowerCase()}`,
            });

            if (invoice.type == INVOICE_TYPES.CUSTOMER) {
                await sendInvoiceDeliveredSMS({ branch_id, invoice });
            }
        } else {
            Validation.isTrue(0);
        }

        await invoice.update({ status }, { transaction: extras.transaction });

        await invoice.reload({
            include: [
                {
                    model: InvoiceItem,
                    as: 'invoiceItems',
                    include: [
                        {
                            model: Batch,
                            as: 'batch',
                            include: [
                                {
                                    model: Item,
                                    as: 'item',
                                }
                            ],
                        },
                    ],
                },
            ],
            transaction: extras.transaction,
        });

        return { invoice, orderPlacedSmses };
    }

    /**
     * 
     * @param {{
     * invoice_id:string
     * branch_id:string
     * invoiceItems:TInvoiceItem[]
     * }} param0 
     * @param {Extras} extras
     */
    static async returnInvoice({ invoice_id, branch_id, invoiceItems }, extras) {
        Validation.emptyArrayParameters(invoiceItems);

        /** @type {TInvoice} */
        const invoice = await findModelOrThrow({ invoice_id }, Invoice, {
            transaction: extras.transaction,
            lock: true,
            include: [
                {
                    model: InvoiceItem,
                    as: 'invoiceItems',
                    include: [
                        {
                            model: Batch,
                            as: 'batch',
                            include: [
                                {
                                    model: Item,
                                    as: 'item',
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        Validation.authority(branch_id, invoice.branch_id);
        Validation.isTrue([INVOICE_STATUSES.COMPLETED, INVOICE_STATUSES.DELIVERED].includes(invoice.status), {
            message: `Only completed invoices can be changed to ${INVOICE_STATUSES.RETURNED.toLowerCase()}`,
        });

        await InvoiceItemService.returnInvoiceItems({ branch_id, invoice_id: invoice.invoice_id }, invoice, invoiceItems, extras);

        await invoice.update({ status: INVOICE_STATUSES.RETURNED }, { transaction: extras.transaction });

        await invoice.reload({
            include: [
                {
                    model: InvoiceItem,
                    as: 'invoiceItems',
                    include: [
                        {
                            model: Batch,
                            as: 'batch',
                            include: [
                                {
                                    model: Item,
                                    as: 'item',
                                }
                            ],
                        },
                    ],
                },
            ],
            transaction: extras.transaction,
        });

        return invoice;
    }
}

module.exports = InvoiceService;
