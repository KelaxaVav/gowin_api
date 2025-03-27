'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { SIGN } = require('../data/constants');
module.exports = (sequelize) => {
  class Batch extends Model {
    static associate(models) {
      // Item
      Batch.belongsTo(models.Item, {
        targetKey: 'item_id',
        foreignKey: 'item_id',
        as: 'item',
      });

      // InvoiceItem
      Batch.hasMany(models.InvoiceItem, {
        foreignKey: 'batch_id',
        sourceKey: 'batch_id',
        as: 'invoiceItems'
      });

      // FrozenBatch
      Batch.hasMany(models.FrozenBatch, {
        foreignKey: 'batch_id',
        sourceKey: 'batch_id',
        as: 'frozenBatches'
      });
    }
  }
  Batch.init({
    ...defaultKeys("batch_id"),
    price: {
      type: DataTypes.DOUBLE.UNSIGNED,
      allowNull: false,
    },
    sign: {
      type: DataTypes.ENUM(Object.keys(SIGN)),
      allowNull: false,
      defaultValue: SIGN.POSITIVE,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    price_min: {
      type: DataTypes.DOUBLE.UNSIGNED,
      allowNull: true,
      defaultValue: null,
    },
  }, modelDefaults(sequelize, 'batches'));
  return Batch;
};