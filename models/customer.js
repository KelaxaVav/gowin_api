'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Customer extends Model {
    static associate(models) {
      // Branch
      Customer.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        targetKey: 'branch_id',
        as: 'branch',
      });

      // Invoice
      Customer.hasMany(models.Invoice, {
        sourceKey: 'customer_id',
        foreignKey: 'party_id',
        as: 'invoices',
      });
    }
  }
  Customer.init({
    ...defaultKeys("customer_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,

    },
    rewards: {
      type: DataTypes.DOUBLE.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  }, modelDefaults(sequelize, 'customers'));
  return Customer;
};