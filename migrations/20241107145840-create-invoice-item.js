'use strict';
const { DISCOUNT_TYPES, INVOICE_ITEM_STATUS } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('invoice_items', {
            ...defaultKeys("invoice_item_id"),
            price: {
                type: Sequelize.DOUBLE.UNSIGNED,
                allowNull: false,
            },
            quantity: {
                type: Sequelize.DOUBLE.UNSIGNED,
                allowNull: false,
            },
            return_quantity: {
                type: Sequelize.DOUBLE.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            discount_type: {
                type: Sequelize.ENUM(Object.keys(DISCOUNT_TYPES)),
                allowNull: true,
            },
            discount_value: {
                type: Sequelize.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
            delivery_at: {
                type: 'TIMESTAMP',
                allowNull: true,
                defaultValue: null,
            },
            status: {
                type: Sequelize.ENUM(Object.keys(INVOICE_ITEM_STATUS)),
                allowNull: false,
                defaultValue: INVOICE_ITEM_STATUS.NORMAL,
            },
            data: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: {
                    message: null,
                    image: null,
                },
            },
            batch_id: relationShip({
                modelName: "batches",
                key: "batch_id",
            }),
            invoice_id: relationShip({
                modelName: "invoices",
                key: "invoice_id",
            }),
            ...migrationDefaults({ paranoid: false }),
        }, {
            collate: process.env.COLLATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('invoice_items');
    }
};