const { Op } = require("sequelize");
const { TransferItem } = require("../models");
const { Validation } = require("../utils/validation");
const BatchService = require("./batch");
const AppError = require("../utils/appError");
const { STATUS_CODE } = require("../utils/utility");

class TransferItemService {
    /**
     * 
     * @param {{
     * transfer_id:string,
     * transfer_from:string
     * type:TTransferType
     * }} param0 
     * @param {TTransferItem[]} transferItems 
     * @param {Extras} extras 
     */
    static async createTransferItems({ transfer_id, transfer_from }, transferItems, extras) {
        if (!transferItems.length) {
            return;
        }

        const batches = await BatchService.validateGenericBatchesWithBranch(transfer_from, transferItems);

        transferItems.forEach(tItem => {
            tItem.transfer_id = transfer_id;
            const { quantity, batch_id } = tItem;
            const batch = batches[batch_id];

            Validation.isTrue(quantity > 0);
            if (quantity > batch.quantity) {
                throw new AppError("Insufficient stock availability", STATUS_CODE.BAD_REQUEST, {
                    name: batch.item.name,
                    item_id: batch.item_id,
                    batch_id: batch.batch_id,
                    quantity: batch.quantity,
                });
            }
        });


        await TransferItem.bulkCreate(transferItems, { transaction: extras.transaction });
    }

    /**
     * 
     * @param {{
     * transfer_id:string
     * transfer_from:string
     * type:TTransferType
     * }} param0 
     * @param {TTransferItem[]} transferItems 
     * @param {{
     *  [key:string]:TTransferItem
     * }} transferItemData 
     * @param {Extras} extras 
     */
    static async updateTransferItems({ type, transfer_from, transfer_id }, transferItems, transferItemData, extras) {
        transferItems.forEach(tItem => {
            const { quantity } = transferItemData[tItem.transfer_item_id];
            const { batch } = tItem;

            Validation.isTrue(quantity > 0);
            if (quantity > batch.quantity) {
                throw new AppError("Insufficient stock availability", STATUS_CODE.BAD_REQUEST, {
                    name: batch.item.name,
                    item_id: batch.item_id,
                    batch_id: batch.batch_id,
                    quantity: batch.quantity,
                });
            }
        });

        await BatchService.validateGenericBatchesWithBranch(transfer_from, transferItems);

        await Promise.all(transferItems.map(async transferItem => {
            const { quantity, batch_id, transferred_at } = transferItemData[transferItem.transfer_item_id];

            await transferItem.update({
                quantity,
                batch_id,
                transferred_at,
            }, { transaction: extras.transaction });
        }));
    }

    /**
     * 
     * @param {TTransferItem[]} transferItems 
     * @param {Extras} extras 
     */
    static async deleteTransferItems(transferItems, extras) {
        if (!transferItems.length) {
            return;
        }

        await TransferItem.destroy({
            where: {
                transfer_item_id: {
                    [Op.in]: transferItems.map(tItem => tItem.transfer_item_id),
                },
            },
            transaction: extras.transaction,
        });
    }
}

module.exports = TransferItemService;
