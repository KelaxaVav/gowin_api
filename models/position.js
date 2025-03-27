'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Position extends Model {
    static associate(models) {
      // Branch
      Position.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        targetKey: 'branch_id',
        as: 'branch',
      });

      // User
      Position.hasMany(models.User, {
        foreignKey: 'position_id',
        sourceKey: 'position_id',
        as: 'users',
      });
    }
  }

  Position.init({
    ...defaultKeys("position_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'positions'));
  return Position;
};