const { Op } = require("sequelize");
const { Batch, Item, Category, FrozenBatch, InvoiceItem } = require("../models");
const { Validation, findModelOrThrow } = require("../utils/validation");
const AppError = require("../utils/appError");
const { STATUS_CODE } = require("../utils/utility");
const { v4 } = require("uuid");
const ItemService = require("./item");
const { FROZEN_BATCH_TYPE } = require("../data/constants");

class BatchService {
    /**
     * 
     * @param {string} branch_id 
     * @param {TBatch} batch 
     * @param {Extras} extras 
     * @returns {Promise<TBatch>}
     */
    static async createBatch(branch_id, { item_id, quantity, price, price_min }, extras) {
        Validation.nullParameters([item_id, quantity, price]);

        const item = await findModelOrThrow({ item_id }, Item, {
            include: [
                {
                    model: Category,
                    as: 'category',
                },
            ],
        });

        Validation.authority(branch_id, item.category.branch_id);

        Validation.isTrue(quantity > 0);
        Validation.isTrue(price > 0);
        price_min && Validation.isTrue(price_min > 0);

        const batch = await Batch.create({
            item_id,
            quantity,
            price,
            price_min,
        }, { transaction: extras.transaction });

        return batch;
    }

    /**
     * Update batch
     * 
     * @param {string} branch_id
     * @param {TBatch} batch
     * @param {Extras} extras
     * @returns 
     */
    static async updateBatch(branch_id, { batch_id, quantity, price, price_min }, extras) {
        const batch = await Batch.findOne({
            where: { batch_id },
            include: [
                {
                    model: InvoiceItem,
                    as: 'invoiceItems',
                },
                {
                    model: Item,
                    as: 'item',
                    include: [
                        {
                            model: Category,
                            as: 'category',
                        },
                    ],
                },
            ],
        });

        Validation.authority(branch_id, batch.item.category.branch_id);

        Validation.isTrue(batch.invoiceItems.length == 0 || !quantity, {
            message: 'Used batch quantity cannot be updated',
        });

        Validation.isTrue(price > 0);
        price_min && Validation.isTrue(price_min > 0);

        await batch.update({
            quantity,
            price,
            price_min,
        }, { transaction: extras.transaction });

        return batch;
    }

    /**
     * 
     * @param {{
     * batch_id:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteBatch({ batch_id, branch_id }, extras) {
        const batch = await findModelOrThrow({ batch_id }, Batch, {
            include: [
                {
                    model: InvoiceItem,
                    as: 'invoiceItems',
                },
                {
                    model: Item,
                    as: 'item',
                    include: [
                        {
                            model: Category,
                            as: 'category',
                        },
                    ],
                },
            ],
            throwOnDeleted: true,
            messageOnDeleted: "Batch is already deleted",
        });

        Validation.isTrue(batch.invoiceItems.length == 0, {
            message: 'Used batch quantity cannot be deleted',
        });

        Validation.authority(branch_id, batch.item.category.branch_id);

        await batch.destroy({ transaction: extras.transaction });
    }

    /**
     * Validate **generic** batches with given branch_id
     * @param {string} branch_id 
     * @param {TInvoiceItem[]} invoiceItems 
     */
    static async validateGenericBatchesWithBranch(branch_id, invoiceItems) {
        if (!invoiceItems.length) {
            return;
        }

        /** @type {TBatch[]} */
        const findBatches = await Batch.findAll({
            include: [
                {
                    model: Item,
                    as: 'item',
                    include: [
                        {
                            model: Category,
                            as: 'category',
                        },
                    ],
                },
            ],
            where: {
                '$item.category.branch_id$': branch_id,
                batch_id: {
                    [Op.in]: invoiceItems.map(iItem => iItem.batch_id),
                },
            },
        });
        Validation.isTrue(findBatches.length == invoiceItems.length);

        /** @type {{[key:string]:TBatch}} */
        const batches = findBatches.reduce((data, batch) => {
            data[batch.batch_id] = batch;
            return data;
        }, {});

        return batches;
    }

    /**
     * 
     * @param {string} branch_id 
     * @param {TInvoiceItem[]} items 
     * @param {Extras} extras 
     * @returns {Promise<TBatch[]>}
     */
    static async createGenericBatches(branch_id, items, extras) {
        if (!items.length) {
            return [];
        }

        await ItemService.validateExistingItemsWithBranch(branch_id, items, extras);

        const batchData = items.map(item => {
            if (!item.batch_id) {
                item.batch_id = v4();
            }

            const { price, item_id, batch_id, price_min } = item;

            Validation.isTrue(price > 0);

            /** @type {TBatch} */
            const newBatch = {
                item_id,
                batch_id,
                price,
                price_min,
            };

            return newBatch;
        });

        const newBatches = await Batch.bulkCreate(batchData, { transaction: extras.transaction });

        return newBatches;
    }

    /**
    * Bulk update **generic** batches
    * 
    * Mostly used in **vendor** invoice updates
    * @param {TInvoiceItem[]} iItems 
    * @param {Extras} extras 
    * @returns 
    */
    static async updateGenericBatches(iItems, extras) {
        await Promise.all(iItems.map(async iItem => {
            const { price, batch } = iItem;
            Validation.isTrue(price > 0);

            await batch.update({
                price,
            }, { transaction: extras.transaction });
        }));
    }

    /**
     * Add quantity to batches
     * @param {{
     * batch_id:string
     * quantity:number
     * }[]} quantities 
     * @param {*} extras 
     */
    static async addBatchQuantity(quantities, extras) {
        const values = {};
        quantities.forEach(batch => {
            const { quantity, batch_id } = batch;
            values[batch_id] = quantity;
        });

        const findBatches = await Batch.findAll({
            include: [
                {
                    model: Item,
                    as: 'item',
                }
            ],
            transaction: extras.transaction,
            lock: true,
            where: {
                batch_id: Object.keys(values),
            }
        });

        await this.incrementQuantities(findBatches, values, extras);
    }

    /**
     * Deduct quantity from batches
     * @param {{
     * batch_id:string
     * quantity:number
     * }[]} quantities 
     * @param {*} extras 
     */
    static async deductBatchQuantity(quantities, extras) {
        const values = {};
        quantities.forEach(batch => {
            const { quantity, batch_id } = batch;
            values[batch_id] = -quantity;
        });

        const findBatches = await Batch.findAll({
            include: [
                {
                    model: Item,
                    as: 'item',
                }
            ],
            transaction: extras.transaction,
            lock: true,
            where: {
                batch_id: Object.keys(values),
            }
        });

        await this.incrementQuantities(findBatches, values, extras);
    }

    /**
     * Freeze batch quantity
     * @param {TFrozenBatchType} type 
     * @param {(TTransferItem & TInvoiceItem)[]} items 
     * @param {Extras} extras 
     */
    static async freezeBatches(type, items, extras) {
        if (!items.length) {
            return;
        }

        const quantities = {};
        const frozenBatchData = items.map((item) => {
            const { quantity, batch_id, invoice_item_id, transfer_item_id } = item;
            quantities[batch_id] = -quantity;

            let owner_id;
            if (type == FROZEN_BATCH_TYPE.INVOICE) {
                owner_id = invoice_item_id;
            } else if (type == FROZEN_BATCH_TYPE.TRANSFER) {
                owner_id = transfer_item_id;
            }

            /** @type {TFrozenBatch} */
            const frozenBatch = {
                batch_id,
                quantity,
                type,
                owner_id,
            }

            return frozenBatch;
        });

        await this.incrementQuantities(items.map(item => item.batch), quantities, extras);

        await FrozenBatch.bulkCreate(frozenBatchData, { transaction: extras.transaction });
    }

    /**
     * Release frozen batch quantity
     * @param {TFrozenBatchType} type 
     * @param {(TTransferItem & TInvoiceItem)[]} items 
     * @param {Extras} extras 
     */
    static async releaseBatches(type, items, extras) {
        if (!items.length) {
            return;
        }

        const ownerIds = items.reduce((data, item) => {
            const { invoice_item_id, transfer_item_id } = item;

            let owner_id;
            if (type == FROZEN_BATCH_TYPE.INVOICE) {
                owner_id = invoice_item_id;
            } else if (type == FROZEN_BATCH_TYPE.TRANSFER) {
                owner_id = transfer_item_id;
            }

            if (!data.includes(owner_id)) {
                data.push(owner_id);
            }

            return data;
        }, []);

        /** @type {TFrozenBatch[]} */
        const frozenBatches = await FrozenBatch.findAll({
            lock: true,
            transaction: extras.transaction,
            where: {
                owner_id: ownerIds,
            },
        });
        Validation.isTrue(frozenBatches.length == items.length);

        /** @type {{[key:string]:number}[]} */
        const quantities = frozenBatches.reduce((data, batch) => {
            const { quantity, batch_id } = batch;
            data[batch_id] = quantity;
            return data;
        }, {});

        await FrozenBatch.destroy({
            transaction: extras.transaction,
            where: {
                owner_id: ownerIds,
            },
        });

        await this.incrementQuantities(items.map(item => item.batch), quantities, extras);
    }

    /**
     * Bulk increment quantity of batches
     * @param {TBatch[]} batches 
     * @param {{[key:string]:number}} values 
     * @param {Extras} extras 
     */
    static async incrementQuantities(batches, values, extras) {
        if (!batches.length) {
            return;
        }

        await Promise.all(batches.map(async batch => {
            const value = values[batch.batch_id];
            if (!value) {
                return;
            }

            if (batch.quantity + value < 0) {
                throw new AppError("Insufficient stock quantity", STATUS_CODE.BAD_REQUEST, {
                    name: batch.item.name,
                    item_id: batch.item_id,
                    batch_id: batch.batch_id,
                    quantity: batch.quantity,
                });
            }

            await batch.increment('quantity', {
                by: value,
                transaction: extras.transaction,
            });

            await batch.reload({ transaction: extras.transaction });
        }));
    }

    /**
     * Bulk increment frozen count of batches
     * @param {TBatch[]} batches 
     * @param {{[key:string]:number}} values 
     * @param {Extras} extras 
     */
    static async incrementFrozenCounts(batches, values, extras) {
        if (!batches.length) {
            return;
        }

        await Promise.all(batches.map(async batch => {
            const value = values[batch.batch_id];
            if (!value) {
                return;
            }

            if (batch.frozen + value < 0) {
                throw new AppError("Insufficient frozen quantity", STATUS_CODE.BAD_REQUEST, {
                    name: batch.item.name,
                    item_id: batch.item_id,
                    batch_id: batch.batch_id,
                    frozen: batch.frozen,
                });
            }

            await batch.increment('frozen', {
                by: value,
                transaction: extras.transaction,
            });

            await batch.reload({ transaction: extras.transaction });
        }));
    }
}

module.exports = BatchService;