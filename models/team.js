'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { ROLES } = require('../data/constants');
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
      Team.belongsTo(models.Staff, {
        foreignKey: 'staff_id',
        targetKey: 'staff_id',
        scope: {
          role: ROLES.BRANCH_MANAGER,
        },
        as: 'branchManager',
      });

      // Staff
      Team.hasMany(models.Staff, {
        sourceKey: 'team_id',
        foreignKey: 'team_id',
        scope: {
          role: ROLES.RELATIONSHIP_MANAGER,
        },
        as: 'relationshipManagers',
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