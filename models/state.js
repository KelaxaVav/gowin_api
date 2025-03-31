'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { GENERAL_TYPES } = require('../data/constants');
module.exports = (sequelize) => {
  class State extends Model {
    static associate(models) {

      State.hasMany(models.City, {
        foreignKey: 'state_id',
        targetKey: 'state_id',
        as: 'cities',
      });
    }
  }
  State.init({
    ...defaultKeys("state_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'states'));


  return State;
};