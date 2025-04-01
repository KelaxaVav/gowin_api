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

      Partner.belongsTo(models.City, {
        targetKey: 'city_id',
        foreignKey: 'city_id',
        as: 'city',
      });

    }
  }

  Partner.init({
    ...defaultKeys("partner_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    door_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pin_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // username: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    // password_hash: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'partners'));

  return Partner;
};