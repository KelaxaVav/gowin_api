'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Vendor extends Model {
    static associate(models) {
      // Branch
      Vendor.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        targetKey: 'branch_id',
        as: 'branch',
      });

      // Invoice
      Vendor.hasMany(models.Invoice, {
        sourceKey: 'vendor_id',
        foreignKey: 'party_id',
        as: 'invoices',
      });
    }
  }
  Vendor.init({
    ...defaultKeys("vendor_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    status: {
      type: DataTypes.ENUM(["ACTIVE", "IN_ACTIVE"]),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
  }, modelDefaults(sequelize, 'vendors'));
  return Vendor;
};