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

      // Position
      Branch.hasMany(models.Position, {
        foreignKey: 'branch_id',
        sourceKey: 'branch_id',
        as: 'positions',
      });

      // Customer
      Branch.hasMany(models.Customer, {
        sourceKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'customers',
      });

      // Vendor
      Branch.hasMany(models.Vendor, {
        sourceKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'vendors',
      });

      // Category
      Branch.hasMany(models.Category, {
        sourceKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'categories',
      });
      Branch.hasMany(models.Category, {
        sourceKey: 'branch_id',
        foreignKey: 'branch_id',
        scope: {
          type: 'MAIN',
        },
        as: 'mainCategories',
      });

      // EventLog
      Branch.hasMany(models.EventLog, {
        foreignKey: 'reference',
        sourceKey: 'branch_id',
        constraints: false,
        as: 'eventlogs',
      });

      // Transaction
      Branch.hasMany(models.Transaction, {
        sourceKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'transactions',
      });

      // Holiday
      Branch.hasMany(models.Holiday, {
        sourceKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'holidays',
      });

      // // Expense
      // Branch.hasMany(models.Expense, {
      //   sourceKey: 'branch_id',
      //   foreignKey: 'branch_id',
      //   as: 'expenses',
      // });
      
      // Staff
      Branch.hasMany(models.Staff, {
        sourceKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'staffs',
      });

      // Expense
      Branch.belongsTo(models.Region, {
        sourceKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'region',
      });
    }
  }
  Branch.init({
    ...defaultKeys("branch_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    contact: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
  }, modelDefaults(sequelize, 'branches'));
  return Branch;
};