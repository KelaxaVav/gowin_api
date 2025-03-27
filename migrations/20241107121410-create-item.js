'use strict';
const { ITEM_TYPES, MEASURE_UNITS } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('items', {
            ...defaultKeys("item_id"),
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            unit: {
                type: Sequelize.ENUM(Object.keys(MEASURE_UNITS)),
                allowNull: false,
                defaultValue: MEASURE_UNITS.PCS,
            },
            threshold: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
            },
            type: {
                type: Sequelize.ENUM(Object.keys(ITEM_TYPES)),
                allowNull: false,
                defaultValue: ITEM_TYPES.GENERIC,
            },
            is_deliverable: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            customItem: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: null,
            },
            category_id: relationShip({
                modelName: "categories",
                key: "category_id",
            }),
            ...migrationDefaults(),
        }, {
            collate: process.env.COLLATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('items');
    }
};