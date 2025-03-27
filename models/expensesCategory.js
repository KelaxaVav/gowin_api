'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class ExpensesCategory extends Model {
    static associate(models) {
    
    }
  }
  ExpensesCategory.init({
    ...defaultKeys("expenses_category_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'expenses_category'));


  return ExpensesCategory;
};