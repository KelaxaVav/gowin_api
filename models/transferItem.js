'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class TransferItem extends Model {
    static associate(models) {
      // Batch
      TransferItem.belongsTo(models.Batch, {
        foreignKey: 'batch_id',
        targetKey: 'batch_id',
        as: 'batch',
      });
      TransferItem.belongsTo(models.Batch, {
        foreignKey: 'transferred_as',
        targetKey: 'batch_id',
        as: 'transferredAs',
      });

      // Transfer
      TransferItem.belongsTo(models.Transfer, {
        foreignKey: 'transfer_id',
        targetKey: 'transfer_id',
        as: 'transfer',
      });

      // FrozenBatch
      TransferItem.hasOne(models.FrozenBatch, {
        foreignKey: 'owner_id',
        sourceKey: 'transfer_item_id',
        as: 'frozenBatch'
      });
    }
  }
  TransferItem.init({
    ...defaultKeys("transfer_item_id"),
    quantity: {
      type: DataTypes.DOUBLE.UNSIGNED,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'transfer_items', { paranoid: false }));
  return TransferItem;
};