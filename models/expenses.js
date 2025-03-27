'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Expenses extends Model {
    static associate(models) {

      Expenses.belongsTo(models.ExpensesCategory, {
        foreignKey: 'expenses_category_id',
        targetKey: 'expenses_category_id',
        as: 'expenses_category',
    });
    }
  }
  Expenses.init({
    ...defaultKeys("expenses_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'expenses'));


  return Expenses;
};