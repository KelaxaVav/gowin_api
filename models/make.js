'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { GENERAL_TYPES } = require('../data/constants');
module.exports = (sequelize) => {
  class Make extends Model {
    static associate(models) {
      Make.hasMany(models.MakeModal, {
        sourceKey: 'make_id',
        foreignKey: 'make_id',
        as: 'makeModals',
      })
    }
  }
  Make.init({
    ...defaultKeys("make_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'makes'));


  return Make;
};