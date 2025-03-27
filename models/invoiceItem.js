'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { DISCOUNT_TYPES, INVOICE_ITEM_STATUS } = require('../data/constants');
module.exports = (sequelize) => {
    class InvoiceItem extends Model {
        static associate(models) {
            // Batch
            InvoiceItem.belongsTo(models.Batch, {
                foreignKey: 'batch_id',
                targetKey: 'batch_id',
                as: 'batch',
            });

            // Invoice
            InvoiceItem.belongsTo(models.Invoice, {
                foreignKey: 'invoice_id',
                targetKey: 'invoice_id',
                as: 'invoice',
            });

            // KitchenOrder
            InvoiceItem.hasOne(models.KitchenOrder, {
                sourceKey: 'invoice_item_id',
                foreignKey: 'entity_id',
                as: 'kitchenOrder',
            });

            // FrozenBatch
            InvoiceItem.hasOne(models.FrozenBatch, {
                foreignKey: 'owner_id',
                sourceKey: 'invoice_item_id',
                as: 'frozenBatch'
            });
        }
    }
    InvoiceItem.init({
        ...defaultKeys("invoice_item_id"),
        price: {
            type: DataTypes.DOUBLE.UNSIGNED,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.DOUBLE.UNSIGNED,
            allowNull: false,
            get() {
                const quantity = this.getDataValue('quantity');
                const return_quantity = this.getDataValue('return_quantity');

                return quantity - return_quantity;
            }
        },
        return_quantity: {
            type: DataTypes.DOUBLE.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        discount_type: {
            type: DataTypes.ENUM(Object.keys(DISCOUNT_TYPES)),
            allowNull: true,
        },
        discount_value: {
            type: DataTypes.DOUBLE.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        delivery_at: {
            type: 'TIMESTAMP',
            allowNull: true,
            defaultValue: null,
        },
        status: {
            type: DataTypes.ENUM(Object.keys(INVOICE_ITEM_STATUS)),
            allowNull: false,
            defaultValue: INVOICE_ITEM_STATUS.NORMAL,
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                message: null,
                image: null,
            },
            sample: {
                message: null,
                image: null,
            },
        },
    }, modelDefaults(sequelize, 'invoice_items', { paranoid: false }));
    return InvoiceItem;
};