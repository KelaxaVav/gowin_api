'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Team extends Model {
    static associate(models) {
      // Branch
      Team.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        targetKey: 'branch_id',
        as: 'branch',
      });

      // Staff
      Team.hasMany(models.Staff, {
        foreignKey: 'team_id',
        sourceKey: 'team_id',
        as: 'staffs',
      });
    }
  }
  Team.init({
    ...defaultKeys("team_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'teams'));

  return Team;
};