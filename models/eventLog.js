'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class EventLog extends Model {
    static associate(models) {
      // User
      EventLog.belongsTo(models.User, {
        foreignKey: 'user_id',
        targetKey: 'user_id',
        as: 'user',
      });
    }
  }
  EventLog.init({
    ...defaultKeys("event_log_id"),
    event: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(["SUCCESS", "FAILED"]),
      allowNull: true,
    },
  }, modelDefaults(sequelize, 'event_logs', { paranoid: false }));
  return EventLog;
};