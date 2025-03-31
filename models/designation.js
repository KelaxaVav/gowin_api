'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Designation extends Model {
    static associate(models) {

      Designation.hasMany(models.Staff, {
        foreignKey: 'designation_id',
        targetKey: 'designation_id',
        as: 'staffs',
      });
    }
  }
  Designation.init({
    ...defaultKeys("designation_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'designations'));


  return Designation;
};