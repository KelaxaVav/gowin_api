'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Role extends Model {
    static associate(models) {
      // Branch
      Role.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        targetKey: 'branch_id',
        as: 'branch',
      });

      // Permission
      Role.belongsToMany(models.Permission, {
        through: models.RolePermission,
        sourceKey: 'role_id',
        foreignKey: 'role_id',
        targetKey: 'permission_id',
        otherKey: 'permission_id',
        as: 'permissions',
      });

      // RolePermission
      Role.hasMany(models.RolePermission, {
        foreignKey: 'role_id',
        sourceKey: 'role_id',
        as: 'rolePermissions',
      });

      // // Staff
      // Role.hasMany(models.Staff, {
      //   foreignKey: 'role_id',
      //   sourceKey: 'role_id',
      //   as: 'staffs',
      // });
    }
  }
  Role.init({
    ...defaultKeys("role_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
  }, modelDefaults(sequelize, 'roles', {
    // indexes: [
    //   {
    //     fields: ['name', 'branch_id'],
    //     name: 'name_branch_id_unique',
    //     unique: true,
    //   },
    // ],
  }));
  return Role;
};