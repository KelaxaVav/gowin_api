'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Notification extends Model {
    static associate(models) {
      // User
      Notification.belongsTo(models.User, {
        foreignKey: 'user_id',
        targetKey: 'user_id',
        as: 'user',
      });
    }
  }
  Notification.init({
    ...defaultKeys("notification_id"),
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(['EVENT_CREATED', 'EVENT_MATCH', 'COMMENT', 'EVENT_REMINDER', 'SUBSCRIPTION_EXPIRY_REMINDER', 'MEDAL', 'CUSTOM']),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  }, modelDefaults(sequelize, 'notifications'));
  return Notification;
};