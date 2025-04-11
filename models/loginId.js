'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class LoginId extends Model {
    static associate(models) {
      LoginId.belongsTo(models.Insurer, {
        foreignKey: 'insurer_id',
        targetKey: 'insurer_id',
        as: 'insurer',
      });
    }
  }
  LoginId.init({
    ...defaultKeys("loginId_id"),
    loginId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'login_id'));


  return LoginId;
};