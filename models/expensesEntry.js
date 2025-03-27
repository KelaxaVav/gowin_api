'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class ExpensesEntry extends Model {
    static associate(models) {

      ExpensesEntry.belongsTo(models.ExpensesCategory, {
        foreignKey: 'expenses_category_id',
        targetKey: 'expenses_category_id',
        as: 'expenses_category',
    });
    
    ExpensesEntry.belongsTo(models.Expenses, {
        foreignKey: 'expenses_id',
        targetKey: 'expenses_id',
        as: 'expenses',
    });
    
  }


  }
  ExpensesEntry.init({
    ...defaultKeys("expenses_entry_id"),
    entry_date: {
      type: "TIMESTAMP",
      allowNull: false,
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    taxes: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'expenses_entry'));


  return ExpensesEntry;
};