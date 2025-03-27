'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Salary extends Model {
    static associate(models) {
      // User
      Salary.belongsTo(models.User, {
        foreignKey: 'user_id',
        targetKey: 'user_id',
        as: 'user',
      });

      // Transaction
      Salary.hasOne(models.Transaction, {
        sourceKey: 'salary_id',
        foreignKey: 'entity_id',
        as: 'transaction',
      });
    }
  }
  Salary.init({
    ...defaultKeys("salary_id"),
    month: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    salaryMonth: {
      type: DataTypes.VIRTUAL,
      get() {
        const monthValue = this.getDataValue('month');
        const month = monthValue.substring(4, 6);
        const year = monthValue.substring(0, 4);

        const timestamp = new Date(year, month - 1);

        return timestamp.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });
      }
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
  }, modelDefaults(sequelize, 'salaries'));
  return Salary;
};