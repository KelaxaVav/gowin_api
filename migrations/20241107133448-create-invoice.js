'use strict';
const { INVOICE_STATUSES, INVOICE_TYPES, DISCOUNT_TYPES } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('invoices', {
            ...defaultKeys("invoice_id"),
            invoice_no: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            party_id: {
                type: Sequelize.STRING,
                allowNull: false,
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
            date: {
                type: 'TIMESTAMP',
                allowNull: false,
            },
            delivery_at: {
                type: 'TIMESTAMP',
                allowNull: true,
                defaultValue: null,
            },
            type: {
                type: Sequelize.ENUM(Object.keys(INVOICE_TYPES)),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM(Object.keys(INVOICE_STATUSES)),
                allowNull: false,
                defaultValue: INVOICE_STATUSES.PENDING,
            },
            branch_id: relationShip({
                modelName: "branches",
                key: "branch_id",
            }),
            data: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: {},
            },
            ...migrationDefaults(),
        }, {
            collate: process.env.COLLATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('invoices');
    }
};