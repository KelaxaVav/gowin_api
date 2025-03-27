const { TRANSFER_TYPES, TRANSFER_STATUSES, ITEM_TYPES, FROZEN_BATCH_TYPE } = require("../data/constants");
const { Batch, Transfer, TransferItem, Item, Branch, Category } = require("../models");
const { Validation, findModelOrThrow } = require("../utils/validation");
const TransferItemService = require("./transferItem");
const AppError = require("../utils/appError");
const { OWNER_ONLY_ACTION } = require("../utils/errorMessage");
const { STATUS_CODE, firstLetterCapital } = require("../utils/utility");
const BatchService = require("./batch");
const CategoryService = require("./category");
const ItemService = require("./item");
const { v4 } = require('uuid');
const { createUniqueNo } = require(".");

class TransferService {
    static async createTransferNo(branch_id) {
        const branch = await findModelOrThrow({ branch_id }, Branch);
        const transfer_no = await createUniqueNo(Transfer, { prefix: branch.code.toUpperCase() }, { transfer_from: branch_id });

        return transfer_no;
    }

    /**
     * 
     * @param {{
     * branch_id:string
     * type:TTransferType
     * transferItems:TTransferItem[]
     * transfer_to:string
     * transfer_from:string
     * transferred_at:Date
     * }} param0 
     * @param {Extras} extras
     */
    static async createTransfer({ branch_id, transfer_from, transferred_at, transferItems, transfer_to, type }, extras) {
        Validation.emptyArrayParameters(transferItems);
        Validation.isTrue(Object.keys(TRANSFER_TYPES).includes(type));

        if (![transfer_from, transfer_to].includes(branch_id)) {
            throw new AppError(OWNER_ONLY_ACTION, STATUS_CODE.FORBIDDEN);
        }

        await findModelOrThrow({ branch_id: transfer_from }, Branch);
        if (type == TRANSFER_TYPES.BRANCH) {
            await findModelOrThrow({ branch_id: transfer_to }, Branch);
        }

        const transfer_no = await this.createTransferNo(branch_id);
        const transfer = await Transfer.create({
            transfer_no,
            type,
            transfer_from,
            transfer_to,
            transferred_at,
        }, { transaction: extras.transaction });

        await TransferItemService.createTransferItems({ type, transfer_from, transfer_id: transfer.transfer_id }, transferItems, extras);

        await transfer.reload({
            include: [
                {
                    model: TransferItem,
                    as: 'transferItems',
                    include: [
                        {
                            model: Batch,
                            as: 'batch',
                        },
                    ],
                },
            ],
            transaction: extras.transaction,
        });

        return transfer;
    }

    /**
     * 
     * @param {{
     * branch_id:string
     * transfer_id:string
     * transferItems:TTransferItem[]
     * transfer_to:string
     * transfer_from:string
     * transferred_at:Date
     * }} param0 
     * @param {Extras} extras
     */
    static async updateTransfer({ transfer_id, branch_id, transferItems, transfer_from, transfer_to, transferred_at }, extras) {
        Validation.emptyArrayParameters(transferItems);

        const transfer = await findModelOrThrow({ transfer_id }, Transfer, {
            transaction: extras.transaction,
            lock: true,
            include: [
                {
                    model: TransferItem,
                    as: 'transferItems',
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

        if (![transfer_from, transfer_to].includes(branch_id)) {
            throw new AppError(OWNER_ONLY_ACTION, STATUS_CODE.FORBIDDEN);
        }
        Validation.isTrue([TRANSFER_STATUSES.PENDING, TRANSFER_STATUSES.REJECTED, TRANSFER_STATUSES.CANCELLED].includes(transfer.status), {
            message: `${firstLetterCapital(transfer.status)} transfer cannot be updated`
        });

        await findModelOrThrow({ branch_id: transfer_from }, Branch);
        if (transfer.type == TRANSFER_TYPES.BRANCH) {
            await findModelOrThrow({ branch_id: transfer_to }, Branch);
        }

        await transfer.update({
            transfer_from,
            transfer_to,
            transferred_at,
        }, { transaction: extras.transaction });

        const updatedTransferItemIds = [];
        const updatedTransferItemData = transferItems.reduce((transferItemData, tItem) => {
            if (tItem.transfer_item_id) {
                transferItemData[tItem.transfer_item_id] = tItem;
                updatedTransferItemIds.push(tItem.transfer_item_id);
            }
            return transferItemData;
        }, {});

        const newTransferItems = transferItems.filter(tItem => !tItem.transfer_item_id);
        const updatedTransferItems = transfer.transferItems.filter(tItem => updatedTransferItemIds.includes(tItem.transfer_item_id));
        const deletedTransferItems = transfer.transferItems.filter(tItem => !updatedTransferItemIds.includes(tItem.transfer_item_id));

        const transferItemIds = transfer.transferItems.map(tItem => tItem.transfer_item_id);
        const invalidTransferItemIds = updatedTransferItemIds.filter(uTItemId => !transferItemIds.includes(uTItemId));
        Validation.isTrue(!invalidTransferItemIds.length);

        await TransferItemService.createTransferItems({ type: transfer.type, transfer_from, transfer_id }, newTransferItems, extras);
        await TransferItemService.updateTransferItems({ type: transfer.type, transfer_from, transfer_id }, updatedTransferItems, updatedTransferItemData, extras);
        await TransferItemService.deleteTransferItems(deletedTransferItems, extras);

        await transfer.reload({
            include: [
                {
                    model: TransferItem,
                    as: 'transferItems',
                    include: [
                        {
                            model: Batch,
                            as: 'batch',
                        },
                    ],
                },
            ],
            transaction: extras.transaction,
        });

        return transfer;
    }

    /**
     * 
     * @param {{
     * transfer_id:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteTransfer({ transfer_id, branch_id }, extras) {
        /** @type {TTransfer} */
        const transfer = await findModelOrThrow({ transfer_id }, Transfer, {
            throwOnDeleted: true,
            messageOnDeleted: "Transfer is already deleted",
        });

        if (![transfer.transfer_from, transfer.transfer_to].includes(branch_id)) {
            throw new AppError(OWNER_ONLY_ACTION, STATUS_CODE.FORBIDDEN);
        }
        Validation.isTrue([TRANSFER_STATUSES.PENDING, TRANSFER_STATUSES.REJECTED, TRANSFER_STATUSES.CANCELLED].includes(transfer.status), {
            message: `${firstLetterCapital(transfer.status)} transfer cannot be deleted`
        });

        await transfer.destroy({ transaction: extras.transaction });
    }

    /**
     * 
     * @param {{
     * branch_id:string
     * transfer_id:string
     * status:TTransferStatus
     * isServiceCall:boolean
     * }} param0 
     * @param {Extras} extras
     */
    static async updateTransferStatus({ branch_id, transfer_id, status, isServiceCall }, extras) {
        /** @type {TTransfer} */
        const transfer = await findModelOrThrow({ transfer_id }, Transfer, {
            transaction: extras.transaction,
            lock: true,
            include: [
                {
                    model: TransferItem,
                    as: 'transferItems',
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

        if (status == transfer.status && !isServiceCall) {
            throw new AppError(`Transfer already ${status.toLowerCase()}`);
        }

        if (isServiceCall && status == TRANSFER_STATUSES.PENDING) {
            return;
        }

        Validation.authority(branch_id, transfer.transfer_from);
        Validation.isTrue(TRANSFER_STATUSES[status]);
        Validation.isTrue(transfer.status != TRANSFER_STATUSES.REJECTED, {
            message: `Transfer is already ${transfer.status.toLowerCase()}`,
        });

        if (status == TRANSFER_STATUSES.CONFIRMED) {
            Validation.isTrue(transfer.status == TRANSFER_STATUSES.PENDING, {
                message: `Transfer is already ${transfer.status.toLowerCase()}`,
            });

            await BatchService.freezeBatches(FROZEN_BATCH_TYPE.TRANSFER, transfer.transferItems, extras);
        } else if ([TRANSFER_STATUSES.PENDING, TRANSFER_STATUSES.CANCELLED].includes(status)) {
            Validation.isTrue(transfer.status == TRANSFER_STATUSES.CONFIRMED, {
                message: `Only confirmed transfers can be changed to ${status.toLowerCase()}`,
            });

            await BatchService.releaseBatches(FROZEN_BATCH_TYPE.TRANSFER, transfer.transferItems, extras);
        } else if (status == TRANSFER_STATUSES.TRANSFERRED) {
            Validation.isTrue(transfer.status == TRANSFER_STATUSES.CONFIRMED, {
                message: `Only confirmed transfers can be changed to ${status.toLowerCase()}`,
            });

            await BatchService.releaseBatches(FROZEN_BATCH_TYPE.TRANSFER, transfer.transferItems, extras);
            await BatchService.deductBatchQuantity(transfer.transferItems, extras);

            if (transfer.type == TRANSFER_TYPES.BRANCH) {
                const newBatches = await this.transferToBranch(transfer, extras);
                await BatchService.addBatchQuantity(newBatches, extras);
            }
        } else if (status == TRANSFER_STATUSES.REJECTED) {
            Validation.isTrue(transfer.status == TRANSFER_STATUSES.PENDING, {
                message: `Only ${TRANSFER_STATUSES.PENDING.toLowerCase()} transfers can be changed to ${status.toLowerCase()}`,
            });
        }

        await transfer.update({
            status,
            transferred_at: status == TRANSFER_STATUSES.TRANSFERRED ? new Date() : null,
        }, { transaction: extras.transaction });

        await transfer.reload({
            include: [
                {
                    model: TransferItem,
                    as: 'transferItems',
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
                        {
                            model: Batch,
                            as: 'transferredAs',
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

        return transfer;
    }

    /**
     * Transfer items to branch
     * @param {TTransfer} transfer 
     * @param {Extras} extras 
     */
    static async transferToBranch(transfer, extras) {
        const uncategorizedCategory = await CategoryService.findUncategorizedCategory(transfer.transfer_to);

        /** @type {TInvoiceItem[]} */
        const newBatches = [];
        for (let i = 0; i < transfer.transferItems.length; i++) {
            const tItem = transfer.transferItems[i];
            tItem.transferred_as = v4();
            const { batch, quantity, transferred_as } = tItem;

            /** @type {TItem} */
            const findItemWithName = await Item.findOne({
                lock: true,
                transaction: extras.transaction,
                include: [
                    {
                        model: Category,
                        as: 'category',
                    },
                ],
                where: {
                    name: tItem.batch.item.name,
                    '$category.branch_id$': transfer.transfer_to,
                }
            });

            if (findItemWithName) {
                newBatches.push({
                    batch_id: transferred_as,
                    item_id: findItemWithName.item_id,
                    price: batch.price,
                    quantity,
                });
                continue;
            }

            const item = await Item.create({
                name: batch.item.name,
                unit: batch.item.unit,
                type: ITEM_TYPES.GENERIC,
                category_id: uncategorizedCategory.category_id,
                batches: [
                    {
                        batch_id: transferred_as,
                        price: batch.price,
                        quantity,
                    }
                ]
            }, { transaction: extras.transaction });

            newBatches.push({
                batch_id: transferred_as,
                item_id: item.item_id,
                price: batch.price,
                quantity,
            });
        }

        await BatchService.createGenericBatches(transfer.transfer_to, newBatches, extras);

        await Promise.all(transfer.transferItems.map(async tItem => {
            await tItem.save({ transaction: extras.transaction });
        }));

        return newBatches;
    }
}

module.exports = TransferService;
