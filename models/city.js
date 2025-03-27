'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { GENERAL_TYPES } = require('../data/constants');
module.exports = (sequelize) => {
  class City extends Model {
    static associate(models) {
    // LeaveRequest
    City.belongsTo(models.State, {
      foreignKey: 'state_id',
      targetKey: 'state_id',
      as: 'state',
    });

    City.hasMany(models.Staff, {
      foreignKey: 'staff_id',
      targetKey: 'staff_id',
      as: 'staffs',
    });


    }
  }
  City.init({
    ...defaultKeys("city_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'cities'));


  return City;
};