'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class BankAccount extends Model {
    static associate(models) {

      BankAccount.belongsTo(models.BankAccountType, {
        targetKey: 'bank_account_type_id',
        foreignKey: 'bank_account_type_id',
        as: 'bankAccountType',
      });

      BankAccount.belongsTo(models.Bank, {
        targetKey: 'bank_id',
        foreignKey: 'bank_id',
        as: 'bank',
      });

    }

  }
  BankAccount.init({
    ...defaultKeys("bank_account_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pan_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ifsc_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gst_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aadhar_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    other_names: {
      type: DataTypes.STRING,
      allowNull: false,
    },
 
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'bank_accounts'));


  return BankAccount;
};