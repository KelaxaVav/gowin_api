'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { DISCOUNT_TYPES } = require('../data/constants');
module.exports = (sequelize) => {
  class KitchenOrderItem extends Model {
    static associate(models) {
      // Item
      KitchenOrderItem.belongsTo(models.Item, {
        foreignKey: 'item_id',
        targetKey: 'item_id',
        as: 'item',
      });

      // Branch
      KitchenOrderItem.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        targetKey: 'branch_id',
        as: 'branch',
      });

      // KitchenOrder
      KitchenOrderItem.hasOne(models.KitchenOrder, {
        sourceKey: 'kitchen_order_item_id',
        foreignKey: 'entity_id',
        as: 'kitchenOrder',
      });
    }
  }
  KitchenOrderItem.init({
    ...defaultKeys("kitchen_order_item_id"),
    price: {
      type: DataTypes.DOUBLE.UNSIGNED,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DOUBLE.UNSIGNED,
      allowNull: false,
    },
    delivery_at: {
      type: 'TIMESTAMP',
      allowNull: true,
      defaultValue: null,
    },
  }, modelDefaults(sequelize, 'kitchen_order_items'));
  return KitchenOrderItem;
};