'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Asset extends Model {
    static associate(models) {
      // User
      Asset.belongsTo(models.User, {
        foreignKey: 'owner_id',
        targetKey: 'user_id',
        constraints: false,
        as: 'user',
      });

      // Item
      Asset.belongsTo(models.Item, {
        foreignKey: 'owner_id',
        targetKey: 'item_id',
        constraints: false,
        as: 'item',
      });

      // Category
      Asset.belongsTo(models.Category, {
        foreignKey: 'owner_id',
        targetKey: 'category_id',
        constraints: false,
        as: 'category',
      });
    }
  }
  Asset.init({
    ...defaultKeys("asset_id"),
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.VIRTUAL,
      get() {
        const path = this.getDataValue('path');
        const url = `${process.env.STORAGE_API_URL}/storage/${path}`;
        return url;
      }
    },
  }, modelDefaults(sequelize, 'assets', {}));
  return Asset;
};