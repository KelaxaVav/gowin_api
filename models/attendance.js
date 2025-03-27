'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { ATTENDANCE_STATUSES } = require('../data/constants');
module.exports = (sequelize) => {
  class Attendance extends Model {
    static associate(models) {
      // User
      Attendance.belongsTo(models.User, {
        foreignKey: 'user_id',
        targetKey: 'user_id',
        as: 'user',
      });

      // LeaveRequest
      Attendance.belongsTo(models.LeaveRequest, {
        foreignKey: 'leave_request_id',
        targetKey: 'leave_request_id',
        as: 'leaveRequest',
      });
    }
  }
  Attendance.init({
    ...defaultKeys("attendance_id"),
    status: {
      type: DataTypes.ENUM(Object.keys(ATTENDANCE_STATUSES)),
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
  }, modelDefaults(sequelize, 'attendances'));
  return Attendance;
};