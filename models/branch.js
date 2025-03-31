'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Branch extends Model {
    static associate(models) {
      // Role
      Branch.hasMany(models.Role, {
        foreignKey: 'branch_id',
        sourceKey: 'branch_id',
        as: 'roles',
      });

      // Staff
      Branch.hasMany(models.Staff, {
        sourceKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'staffs',
      });

      // Region
      Branch.belongsTo(models.Region, {
        sourceKey: 'region_id',
        foreignKey: 'region_id',
        as: 'region',
      });

      // Team
      Branch.hasMany(models.Team, {
        sourceKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'teams',
      });
    }
  }
  Branch.init({
    ...defaultKeys("branch_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'branches'));

  return Branch;
};