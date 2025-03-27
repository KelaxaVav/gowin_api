'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { GENERAL_TYPES } = require('../data/constants');
module.exports = (sequelize) => {
  class BankAccountTypes extends Model {
    static associate(models) {

    }
  }
  BankAccountTypes.init({
    ...defaultKeys("bank_account_type_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
 
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'bank_account_types'));


  return BankAccountTypes;
};