'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Device extends Model {
    static associate(models) {
      // User
      Device.belongsTo(models.User, {
        foreignKey: 'user_id',
        targetKey: 'user_id',
        as: 'user',
      });
    }
  }
  Device.init({
    ...defaultKeys("device_id"),
    platform: {
      type: DataTypes.ENUM(["ANDROID", "IOS", "WEB"]),
      allowNull: false,
    },
    fcm_token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, modelDefaults(sequelize, 'devices', { paranoid: false }));
  return Device;
};