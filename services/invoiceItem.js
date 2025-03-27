const { Op } = require("sequelize");
const { v4 } = require("uuid");
const { INVOICE_TYPES, ITEM_TYPES, KITCHEN_ORDER_STATUSES, INVOICE_ITEM_STATUS } = require("../data/constants");
const { InvoiceItem, Batch, Item } = require("../models");
const { Validation } = require("../utils/validation");
const ItemService = require("./item");
const CommonService = require("./common");
const BatchService = require("./batch");
const KitchenService = require("./kitchen");
const AppError = require("../utils/appError");
const { STATUS_CODE } = require("../utils/utility");

class InvoiceItemService {
    /**
     * 
     * @param {{
     * invoice_id:string,
     * branch_id:string
     * type:TInvoiceType
     * }} param0 
     * @param {TInvoiceItem[]} invoiceItems 
     * @param {Extras} extras 
     */
    static async createInvoiceItems({ invoice_id, branch_id, type }, invoiceItems, extras) {
        if (!invoiceItems.length) {
            return;
        }

        invoiceItems.forEach(iItem => {
            iItem.invoice_id = invoice_id;
            iItem.invoice_item_id = v4();
            const { discount_type, discount_value, price, quantity, data } = iItem;

            Validation.isTrue(parseFloat(price) > 0);
            Validation.isTrue(parseFloat(quantity) > 0);
            CommonService.validateDiscount(discount_type, discount_value);

            iItem.data = {
                message: data.message ?? null,
                images: data.images ?? null,
            };
        });

        if (type == INVOICE_TYPES.CUSTOMER) {
            const genericInvoiceItems = invoiceItems.filter(i => i.type == ITEM_TYPES.GENERIC);
            const batches = await BatchService.validateGenericBatchesWithBranch(branch_id, genericInvoiceItems);

            genericInvoiceItems.forEach(iItem => {
                const { batch_id, quantity } = iItem;
                const batch = batches[batch_id];

                Validation.isTrue(batch.quantity >= quantity, {
                    message: "Insufficient stock availability",
                    data: {
                        name: batch.item.name,
                        item_id: batch.item_id,
                        batch_id: batch.batch_id,
                        quantity: batch.quantity,
                    },
                });
            });

            const customItems = invoiceItems.filter(i => i.type == ITEM_TYPES.CUSTOM);
            await ItemService.createCustomItems(branch_id, customItems, extras);
        }
        else if (type == INVOICE_TYPES.VENDOR) {
            const existingItems = invoiceItems.filter(i => i.item_id);
            await BatchService.createGenericBatches(branch_id, existingItems, extras);

            const newItems = invoiceItems.filter(i => !i.item_id);
            await ItemService.createGenericItems(branch_id, newItems, extras);
        }

        await InvoiceItem.bulkCreate(invoiceItems, { transaction: extras.transaction });
    }

    /**
     * 
     * @param {{
     * branch_id:string
     * type:TInvoiceType
     * }} param0 
     * @param {TInvoiceItem[]} invoiceItems 
     * @param {{
     *  [key:string]:TInvoiceItem
     * }} invoiceItemData 
     * @param {Extras} extras 
     */
    static async updateInvoiceItems({ type, branch_id }, invoiceItems, invoiceItemData, extras) {
        // const batches = [];
        // const values = {};
        invoiceItems.forEach(iItem => {
            const { discount_type, discount_value, price, quantity, data } = invoiceItemData[iItem.invoice_item_id];
            const { batch, kitchenOrder } = iItem;
            CommonService.validateDiscount(discount_type, discount_value);
            Validation.isTrue(price > 0);
            Validation.isTrue(quantity > 0);

            if (type == INVOICE_TYPES.CUSTOMER) {
                Validation.isTrue(batch.quantity >= quantity, {
                    message: "Insufficient stock availability",
                    data: {
                        name: batch.item.name,
                        item_id: batch.item_id,
                        batch_id: batch.batch_id,
                        quantity: batch.quantity,
                    },
                });
            }

            // let quantityChange = 0;
            // if (type == INVOICE_TYPES.CUSTOMER && iItem.batch.item.type == ITEM_TYPES.GENERIC) {
            //     quantityChange = iItem.quantity - quantity;
            // } else if (type == INVOICE_TYPES.VENDOR) {
            //     // Validation.isTrue(iItem.quantity == iItem.batch.quantity, { message: "Used invoice items cannot be updated" });
            //     quantityChange = quantity - iItem.quantity;
            // }

            // values[iItem.batch_id] = quantityChange;
            // batches.push(iItem.batch);

            iItem.data = {
                message: data.message ?? null,
                images: data.images ?? null,
            };

            if (batch.item.type == ITEM_TYPES.CUSTOM && kitchenOrder.status != KITCHEN_ORDER_STATUSES.PENDING) {
                Validation.isTrue(quantity == iItem.quantity, {
                    message: `Can't update quantity of ${kitchenOrder.status.toLowerCase()} kitchen order`,
                });
            }
        });

        await Promise.all(invoiceItems.map(async invoiceItem => {
            const { price, quantity, discount_type, discount_value, delivery_at, customItem } = invoiceItemData[invoiceItem.invoice_item_id];
            invoiceItem.customItem = customItem;
            await invoiceItem.update({
                price,
                quantity,
                discount_type,
                discount_value,
                delivery_at,
            }, { transaction: extras.transaction });
        }));

        /* These lines should be excecuted only after updating invoiceItems */
        if (type == INVOICE_TYPES.CUSTOMER) {
            const customItems = invoiceItems.filter(iItem => iItem.batch.item.type == ITEM_TYPES.CUSTOM);
            await ItemService.updateCustomItems(branch_id, customItems, extras);

            const genericInvoiceItems = invoiceItems.filter(i => i.type == ITEM_TYPES.GENERIC);
            genericInvoiceItems.forEach(iItem => {
                const { quantity, batch } = iItem;

                if (quantity > batch.quantity) {
                    throw new AppError("Insufficient stock availability", STATUS_CODE.BAD_REQUEST, {
                        name: batch.item.name,
                        item_id: batch.item_id,
                        batch_id: batch.batch_id,
                        quantity: batch.quantity,
                    });
                }
            });
        }
        else if (type == INVOICE_TYPES.VENDOR) {
            await BatchService.updateGenericBatches(invoiceItems, extras);
        }

        // await BatchService.incrementQuantities(batches, values, extras);
    }

    /**
     * 
     * @param {{
     * type:TInvoiceType
     * }} param0 
     * @param {TInvoiceItem[]} invoiceItems 
     * @param {Extras} extras 
     */
    static async deleteInvoiceItems({ type }, invoiceItems, extras) {
        if (!invoiceItems.length) {
            return;
        }

        await InvoiceItem.destroy({
            where: {
                invoice_item_id: {
                    [Op.in]: invoiceItems.map(iItem => iItem.invoice_item_id),
                },
            },
            transaction: extras.transaction,
        });

        if (type == INVOICE_TYPES.CUSTOMER) {
            const customItems = invoiceItems.filter(iItem => iItem.batch.item.type == ITEM_TYPES.CUSTOM);
            customItems.forEach(iItem => {
                if (![KITCHEN_ORDER_STATUSES.PENDING, KITCHEN_ORDER_STATUSES.CANCELLED].includes(iItem.kitchenOrder.status)) {
                    throw new AppError(`Can't delete invoice item of ${iItem.kitchenOrder.status.toLowerCase()} kitchen order`, STATUS_CODE.BAD_REQUEST);
                }
            });

            // const batches = [];
            // const values = invoiceItems.reduce((iItemData, iItem) => {
            //     iItemData[iItem.invoice_item_id] = iItem.quantity;
            //     batches.push(iItem.batch);

            //     return iItemData;
            // }, {});

            // await BatchService.incrementQuantities(batches, values, extras);

            const customItemIds = customItems.reduce((ids, iItem) => {
                ids.push(iItem.batch.item.item_id);
                return ids;
            }, []);

            await Item.destroy({
                force: true,
                where: {
                    item_id: customItemIds,
                },
                transaction: extras.transaction,
            });
        } else if (type == INVOICE_TYPES.VENDOR) {

            // no need
            // but check
            // invoiceItems.forEach(iItem => Validation.isTrue(iItem.quantity == iItem.batch.quantity, { message: "Used invoice items cannot be deleted" }));

            await Batch.destroy({
                force: true,
                where: {
                    batch_id: invoiceItems.map(iItem => iItem.batch_id),
                },
                transaction: extras.transaction,
            });
        }
    }

    /**
     * 
     * @param {{
     * invoice_id:string,
     * branch_id:string
     * }} param0 
     * @param {TInvoice} invoice 
     * @param {TInvoiceItem[]} invoiceItems 
     * @param {Extras} extras 
     */
    static async returnInvoiceItems({ invoice_id, branch_id }, invoice, invoiceItems, extras) {
        if (!invoiceItems.length) {
            return;
        }

        /** @type {{[key:string]:TInvoiceItem}} */
        const invoiceItemData = invoice.invoiceItems.reduce((data, iItem) => {
            data[iItem.invoice_item_id] = iItem;
            return data;
        }, {});

        /** @type {TInvoiceItem[]} */
        const iItems = [];
        const quantities = invoiceItems.map(iItem => {
            const { return_quantity, invoice_item_id } = iItem;
            const invoiceItem = invoiceItemData[invoice_item_id];
            const { batch, batch_id } = invoiceItem;

            Validation.nullParameters([return_quantity, invoice_item_id]);
            Validation.isTrue(invoiceItem);
            Validation.isTrue(invoiceItem.batch.item.type == ITEM_TYPES.GENERIC);
            Validation.isTrue(return_quantity <= invoiceItem.quantity);

            if (invoice.type == INVOICE_TYPES.VENDOR) {
                if (return_quantity > batch.quantity) {
                    throw new AppError("Insufficient stock availability", STATUS_CODE.BAD_REQUEST, {
                        name: batch.item.name,
                        item_id: batch.item_id,
                        batch_id: batch.batch_id,
                        quantity: batch.quantity,
                    });
                }
            }

            invoiceItem.return_quantity = return_quantity;
            iItems.push(invoiceItem);

            return {
                batch_id,
                quantity: return_quantity,
            }
        });

        if (invoice.type == INVOICE_TYPES.CUSTOMER) {
            await BatchService.addBatchQuantity(quantities, extras);
        } else if (invoice.type == INVOICE_TYPES.VENDOR) {
            await BatchService.deductBatchQuantity(quantities, extras);
        }

        await Promise.all(iItems.map(async iItem => {
            await iItem.save({
                fields: ['return_quantity'],
                transaction: extras.transaction,
            });
        }));
    }
}

module.exports = InvoiceItemService;
