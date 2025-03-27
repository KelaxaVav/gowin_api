'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { LEAVE_REQUEST_TYPES, LEAVE_REQUEST_STATUSES, LEAVE_REQUEST_PURPOSES } = require('../data/constants');
module.exports = (sequelize) => {
  class LeaveRequest extends Model {
    static associate(models) {
      // User
      LeaveRequest.belongsTo(models.User, {
        foreignKey: 'user_id',
        targetKey: 'user_id',
        as: 'user',
      });

      // Attendance
      LeaveRequest.hasOne(models.Attendance, {
        sourceKey: 'leave_request_id',
        foreignKey: 'leave_request_id',
        as: 'attendance',
      });
    }
  }
  LeaveRequest.init({
    ...defaultKeys("leave_request_id"),
    type: {
      type: DataTypes.ENUM(Object.keys(LEAVE_REQUEST_TYPES)),
      allowNull: false,
    },
    purpose: {
      type: DataTypes.ENUM(Object.keys(LEAVE_REQUEST_PURPOSES)),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_at: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    end_at: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM(Object.keys(LEAVE_REQUEST_STATUSES)),
      allowNull: false,
      defaultValue: LEAVE_REQUEST_STATUSES.PENDING,
    },
  }, modelDefaults(sequelize, 'leave_requests'));
  return LeaveRequest;
};