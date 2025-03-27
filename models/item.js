'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { ITEM_TYPES, MEASURE_UNITS } = require('../data/constants');
const { itemAfterFind } = require('../helper/item');
module.exports = (sequelize) => {
  class Item extends Model {
    static associate(models) {
      // Category
      Item.belongsTo(models.Category, {
        targetKey: 'category_id',
        foreignKey: 'category_id',
        as: 'category',
      });

      // Batch
      Item.hasMany(models.Batch, {
        sourceKey: 'item_id',
        foreignKey: 'item_id',
        as: 'batches',
      });

      // Image
      Item.hasOne(models.Asset, {
        sourceKey: 'item_id',
        foreignKey: 'owner_id',
        as: 'image',
      });
    }
  }
  Item.init({
    ...defaultKeys("item_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit: {
      type: DataTypes.ENUM(Object.keys(MEASURE_UNITS)),
      allowNull: false,
      defaultValue: MEASURE_UNITS.PCS,
    },
    threshold: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(Object.keys(ITEM_TYPES)),
      allowNull: false,
      defaultValue: ITEM_TYPES.GENERIC,
    },
    is_deliverable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    customItem: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    }
  }, modelDefaults(sequelize, 'items'));

  Item.addHook('afterFind', findResult => {
    if (findResult && !Array.isArray(findResult)) {
      findResult = [findResult];
    }

    findResult?.length && itemAfterFind(findResult);
  });

  return Item;
};