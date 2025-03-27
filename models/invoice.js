'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { INVOICE_STATUSES, INVOICE_TYPES, DISCOUNT_TYPES } = require('../data/constants');
const { invoiceAfterFind } = require('../helper/invoice');
module.exports = (sequelize) => {
  class Invoice extends Model {
    static associate(models) {
      // Customer
      Invoice.belongsTo(models.Customer, {
        targetKey: 'customer_id',
        foreignKey: 'party_id',
        constraints: false,
        as: 'customer',
      });

      // Vendor
      Invoice.belongsTo(models.Vendor, {
        targetKey: 'vendor_id',
        foreignKey: 'party_id',
        constraints: false,
        as: 'vendor',
      });

      // Branch
      Invoice.belongsTo(models.Branch, {
        targetKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'branch',
      });

      // InvoiceItem
      Invoice.hasMany(models.InvoiceItem, {
        sourceKey: 'invoice_id',
        foreignKey: 'invoice_id',
        as: 'invoiceItems',
      });

      // Transaction
      Invoice.hasMany(models.Transaction, {
        sourceKey: 'invoice_id',
        foreignKey: 'entity_id',
        as: 'transactions',
      });
    }
  }
  Invoice.init({
    ...defaultKeys("invoice_id"),
    invoice_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discount_type: {
      type: DataTypes.ENUM(Object.keys(DISCOUNT_TYPES)),
      allowNull: true,
    },
    discount_value: {
      type: DataTypes.DOUBLE.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    date: {
      type: 'TIMESTAMP',
      allowNull: false,
    },
    delivery_at: {
      type: 'TIMESTAMP',
      allowNull: true,
      defaultValue: null,
    },
    type: {
      type: DataTypes.ENUM(Object.keys(INVOICE_TYPES)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(Object.keys(INVOICE_STATUSES)),
      allowNull: false,
      defaultValue: INVOICE_STATUSES.PENDING,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  }, modelDefaults(sequelize, 'invoices'));

  Invoice.addHook('afterFind', findResult => {
    if (findResult && !Array.isArray(findResult)) {
      findResult = [findResult];
    }

    findResult?.length && invoiceAfterFind(findResult);
  });

  return Invoice;
};