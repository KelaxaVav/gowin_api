'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { GENERAL_TYPES } = require('../data/constants');
module.exports = (sequelize) => {
  class Partner extends Model {
    static associate(models) {
      Partner.belongsTo(models.Staff, {
        targetKey: 'staff_id',
        foreignKey: 'staff_id',
        as: 'staff',
      });
    }
  }
  Partner.init({
    ...defaultKeys("partner_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'partners'));

  return Partner;
};