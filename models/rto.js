'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class RTO extends Model {
    static associate(models) {
      RTO.belongsTo(models.State, {
        foreignKey: 'state_id',
        targetKey: 'state_id',
        as: 'state',
      });
      RTO.belongsTo(models.RTOCategory, {
        foreignKey: 'rto_category_id',
        targetKey: 'rto_category_id',
        as: 'rto_category',
      });
    }
  }
  RTO.init({
    ...defaultKeys("rto_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'rto'));


  return RTO;
};