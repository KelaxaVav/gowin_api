'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { TRANSFER_TYPES, TRANSFER_STATUSES } = require('../data/constants');
module.exports = (sequelize) => {
  class Transfer extends Model {
    static associate(models) {
      // Branch
      Transfer.belongsTo(models.Branch, {
        targetKey: 'branch_id',
        foreignKey: 'transfer_from',
        as: 'transferFrom',
      });

      // Branch
      Transfer.belongsTo(models.Branch, {
        targetKey: 'branch_id',
        foreignKey: 'transfer_to',
        as: 'transferTo',
      });

      // TransferItem
      Transfer.hasMany(models.TransferItem, {
        sourceKey: 'transfer_id',
        foreignKey: 'transfer_id',
        as: 'transferItems',
      });
    }
  }
  Transfer.init({
    ...defaultKeys("transfer_id"),
    transfer_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(Object.keys(TRANSFER_TYPES)),
      allowNull: false,
    },
    transferred_at: {
      type: 'TIMESTAMP',
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM(Object.keys(TRANSFER_STATUSES)),
      allowNull: false,
      defaultValue: TRANSFER_STATUSES.PENDING,
    },
  }, modelDefaults(sequelize, 'transfers'));
  return Transfer;
};