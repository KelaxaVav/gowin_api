'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Insurer extends Model {
    static associate(models) {
      Insurer.hasMany(models.RTOCategory, {
        sourceKey: 'insurer_id',
        foreignKey: 'insurer_id',
        as: 'rtoCategories',
      });
    }
  }
  Insurer.init({
    ...defaultKeys("insurer_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'insurers'));


  return Insurer;
};