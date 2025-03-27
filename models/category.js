'use strict';
const { Model, DataTypes, Op } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { CATEGORY_TYPES } = require('../data/constants');
module.exports = (sequelize) => {
  class Category extends Model {
    static associate(models) {
      // Category Children
      Category.hasMany(models.Category, {
        foreignKey: 'parent_id',
        sourceKey: 'category_id',
        scope: {
          name: { [Op.ne]: 'CUSTOM_PRESET' },
        },
        as: 'categories',
      });

      Category.hasMany(models.Category, {
        foreignKey: 'parent_id',
        sourceKey: 'category_id',
        scope: {
          type: 'CUSTOM',
        },
        as: 'options',
      });

      // Parent Category
      Category.belongsTo(models.Category, {
        foreignKey: 'parent_id',
        targetKey: 'category_id',
        as: 'category',
      });

      // Item
      Category.hasMany(models.Item, {
        sourceKey: 'category_id',
        foreignKey: 'category_id',
        as: 'items',
      });

      // Branch
      Category.belongsTo(models.Branch, {
        targetKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'branch',
      });

      // Image
      Category.hasOne(models.Asset, {
        sourceKey: 'category_id',
        foreignKey: 'owner_id',
        as: 'image',
      });
    }
  }
  Category.init({
    ...defaultKeys("category_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE.UNSIGNED,
      allowNull: true,
      defaultValue: null,
    },
    type: {
      type: DataTypes.ENUM(Object.keys(CATEGORY_TYPES)),
      allowNull: false,
    },
    visibility: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    children: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    // image: {
    //   type: DataTypes.VIRTUAL,
    //   get() {
    //     const name = this.getDataValue('name');
    //     return getImage(name);
    //   },
    // },
  }, modelDefaults(sequelize, 'categories'));
  return Category;
};