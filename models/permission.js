'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Permission extends Model {
    static associate(models) {
      // Role
      Permission.belongsToMany(models.Role, {
        through: models.RolePermission,
        sourceKey: 'permission_id',
        foreignKey: 'permission_id',
        targetKey: 'role_id',
        otherKey: 'role_id',
        as: 'roles',
      });

      // RolePermission
      Permission.hasMany(models.RolePermission, {
        foreignKey: 'permission_id',
        sourceKey: 'permission_id',
        as: 'rolePermissions',
      });
    }
  }
  Permission.init({
    ...defaultKeys("permission_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, modelDefaults(sequelize, 'permissions'));
  return Permission;
};