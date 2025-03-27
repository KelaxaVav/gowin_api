'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { TRANSACTION_ENTITY_TYPES, TRANSACTION_STATUSES, TRANSACTION_REASONS, TRANSACTION_METHODS } = require('../data/constants');
module.exports = (sequelize) => {
  class Transaction extends Model {
    static associate(models) {
      // Branch
      Transaction.belongsTo(models.Branch, {
        targetKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'branch',
      });

      // Invoice
      Transaction.belongsTo(models.Invoice, {
        targetKey: 'invoice_id',
        foreignKey: 'entity_id',
        as: 'invoice',
      });

      // Salary
      Transaction.belongsTo(models.Salary, {
        targetKey: 'salary_id',
        foreignKey: 'entity_id',
        as: 'salary',
      });

      // // Expense
      // Transaction.belongsTo(models.Expense, {
      //   targetKey: 'expense_id',
      //   foreignKey: 'entity_id',
      //   as: 'expense',
      // });
    }
  }
  Transaction.init({
    ...defaultKeys("transaction_id"),
    entity_type: {
      type: DataTypes.ENUM(Object.keys(TRANSACTION_ENTITY_TYPES)),
      allowNull: false,
    },
    reason: {
      type: DataTypes.ENUM(Object.keys(TRANSACTION_REASONS)),
      allowNull: false,
    },
    date: {
      type: 'TIMESTAMP',
      allowNull: false,
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM(Object.keys(TRANSACTION_METHODS)),
      allowNull: false,
      defaultValue: TRANSACTION_METHODS.CASH,
    },
    status: {
      type: DataTypes.ENUM(Object.keys(TRANSACTION_STATUSES)),
      allowNull: false,
      defaultValue: TRANSACTION_STATUSES.COMPLETED,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, modelDefaults(sequelize, 'transactions'));
  return Transaction;
};