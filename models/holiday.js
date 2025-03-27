'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { WEEKDAYS, HOLIDAY_TYPES, HOLIDAY_LEAVE_TYPES } = require('../data/constants');
module.exports = (sequelize) => {
  class Holiday extends Model {
    static associate(models) {
      // Branch
      Holiday.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        targetKey: 'branch_id',
        as: 'branch',
      });
    }
  }
  Holiday.init({
    ...defaultKeys("holiday_id"),
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    leave_type: {
      type: DataTypes.ENUM(Object.keys(HOLIDAY_LEAVE_TYPES)),
      allowNull: false,
    },
    day: {
      type: DataTypes.ENUM(Object.keys(WEEKDAYS)),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(Object.keys(HOLIDAY_TYPES)),
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'holidays'));
  return Holiday;
};