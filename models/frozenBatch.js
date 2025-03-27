'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { FROZEN_BATCH_TYPE } = require('../data/constants');
module.exports = (sequelize) => {
    class FrozenBatch extends Model {
        static associate(models) {
            // Batch
            FrozenBatch.belongsTo(models.Batch, {
                foreignKey: 'batch_id',
                targetKey: 'batch_id',
                as: 'batch',
            });

            // InvoiceItem
            FrozenBatch.belongsTo(models.InvoiceItem, {
                foreignKey: 'owner_id',
                targetKey: 'invoice_item_id',
                as: 'invoiceItem',
            });

            // TransferItem
            FrozenBatch.belongsTo(models.TransferItem, {
                foreignKey: 'owner_id',
                targetKey: 'transfer_item_id',
                as: 'transferItem',
            });
        }
    }
    FrozenBatch.init({
        ...defaultKeys("frozen_batch_id"),
        type: {
            type: DataTypes.ENUM(Object.keys(FROZEN_BATCH_TYPE)),
            allowNull: true,
        },
        quantity: {
            type: DataTypes.DOUBLE.UNSIGNED,
            allowNull: false,
        },
    }, modelDefaults(sequelize, 'frozen_batches', { paranoid: false }));
    return FrozenBatch;
};