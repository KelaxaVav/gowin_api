"use strict";
const { Model, DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');
const { defaultKeys, modelDefaults } = require("../sequelize/defaults");
const { USER_STATUSES } = require("../data/constants");
module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
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
    }
  }

  User.init({
    ...defaultKeys("user_id"),
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      set(val) {
        this.setDataValue('password', bcrypt.hashSync(val, 10));
      },
      get() { },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, "users"));
  return User;
};
