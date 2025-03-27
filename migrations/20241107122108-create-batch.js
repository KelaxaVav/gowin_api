'use strict';
const { SIGN } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('batches', {
            ...defaultKeys("batch_id"),
            item_id: relationShip({
                modelName: "items",
                key: "item_id",
            }),
            price: {
                type: Sequelize.DOUBLE.UNSIGNED,
                allowNull: false,
            },
            sign: {
                type: Sequelize.ENUM(Object.keys(SIGN)),
                allowNull: false,
                defaultValue: SIGN.POSITIVE,
            },
            quantity: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            price_min: {
                type: Sequelize.DOUBLE.UNSIGNED,
                allowNull: true,
                defaultValue: null,
            },
            ...migrationDefaults(),
        }, {
            collate: process.env.COLLATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('batches');
    }
};