"use strict";
const { Model, DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');
const { defaultKeys, modelDefaults } = require("../sequelize/defaults");
const { USER_STATUSES } = require("../data/constants");
module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Role
      User.belongsTo(models.Role, {
        foreignKey: 'role_id',
        targetKey: 'role_id',
        as: "role",
      });

      // Position
      User.belongsTo(models.Position, {
        foreignKey: 'position_id',
        targetKey: 'position_id',
        as: "position",
      });

      // Notification
      User.hasMany(models.Notification, {
        foreignKey: "user_id",
        sourceKey: "user_id",
        as: "notifications",
      });

      // Asset
      User.hasOne(models.Asset, {
        foreignKey: "owner_id",
        sourceKey: "user_id",
        constraints: false,
        scope: {
          type: "USER_PROFILE",
        },
        as: "profileImage",
      });

      // Device
      User.hasMany(models.Device, {
        sourceKey: "user_id",
        foreignKey: "user_id",
        as: "devices",
      });

      // Salary
      User.hasMany(models.Salary, {
        sourceKey: "user_id",
        foreignKey: "user_id",
        as: "salaries",
      });

      // LeaveRequest
      User.hasMany(models.LeaveRequest, {
        sourceKey: "user_id",
        foreignKey: "user_id",
        as: "leaveRequests",
      });
    }
  }

  User.init({
    ...defaultKeys("user_id"),
    staff_no: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    mobile: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // unique: true,
    },
    nic: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    password: {
      type: DataTypes.VIRTUAL,
      set(val) {
        this.setDataValue('password_hash', bcrypt.hashSync(val, 10));
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      get() { },
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: false,
      sample: {
        salary: "",
        joined_at: "",
        yearly_leave: "",
        gender: "",
        address: "",
        dob: "",
      },
    },
    status: {
      type: DataTypes.ENUM(Object.keys(USER_STATUSES)),
      allowNull: false,
      defaultValue: USER_STATUSES.ACTIVE,
    },
  }, modelDefaults(sequelize, "users"));
  return User;
};
