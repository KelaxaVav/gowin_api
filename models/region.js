'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Region extends Model {
    static associate(models) {
      Region.hasMany(models.Branch, {
        sourceKey: 'region_id',
        foreignKey: 'region_id',
        as: 'branches',
      });
    }
  }
  Region.init({
    ...defaultKeys("region_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'regions'));

  return Region;
};