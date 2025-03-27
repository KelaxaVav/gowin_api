'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { KITCHEN_ORDER_STATUSES, KITCHEN_ORDER_TYPES } = require('../data/constants');
module.exports = (sequelize) => {
  class KitchenOrder extends Model {
    static associate(models) {
      // InvoiceItem
      KitchenOrder.belongsTo(models.InvoiceItem, {
        targetKey: 'invoice_item_id',
        foreignKey: 'entity_id',
        constraints: false,
        as: 'invoiceItem',
      });

      // KitchenOrderItem
      KitchenOrder.belongsTo(models.KitchenOrderItem, {
        targetKey: 'kitchen_order_item_id',
        foreignKey: 'entity_id',
        constraints: false,
        as: 'kitchenOrderItem',
      });

    }
  }
  KitchenOrder.init({
    ...defaultKeys("kitchen_order_id"),
    order_no: {
      type: DataTypes.VIRTUAL,
      get() {
        const id = this.getDataValue('id');

        if (id) {
          return `ORD${id.toString().padStart(5, '0')}`;
        }
      }
    },
    type: {
      type: DataTypes.ENUM(Object.keys(KITCHEN_ORDER_TYPES)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(Object.keys(KITCHEN_ORDER_STATUSES)),
      allowNull: false,
      defaultValue: KITCHEN_ORDER_STATUSES.PENDING,
    },
  }, modelDefaults(sequelize, 'kitchen_orders'));
  return KitchenOrder;
};