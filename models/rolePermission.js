'use strict';
const { Model } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class RolePermission extends Model {
    static associate(models) {
      // Role
      RolePermission.belongsTo(models.Role, {
        foreignKey: 'role_id',
        targetKey: 'role_id',
        as: 'role',
      });

      // Permission
      RolePermission.belongsTo(models.Permission, {
        foreignKey: 'permission_id',
        targetKey: 'permission_id',
        as: 'permission',
      });
    }
  }
  RolePermission.init({
    ...defaultKeys("role_permission_id"),
  }, modelDefaults(sequelize, 'role_permissions', { paranoid: false }));
  return RolePermission;
};