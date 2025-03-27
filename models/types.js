'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { GENERAL_TYPES } = require('../data/constants');
module.exports = (sequelize) => {
  class Type extends Model {
    static associate(models) {
    
    }
  }
  Type.init({
    ...defaultKeys("type_id"),
   name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(Object.keys(GENERAL_TYPES)),
        allowNull: false,
      },
  }, modelDefaults(sequelize, 'types'));


  return Type;
};