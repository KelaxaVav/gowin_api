'use strict';
const { CATEGORY_TYPES } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('categories', {
            ...defaultKeys("category_id"),
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            price: {
                type: Sequelize.DOUBLE,
                allowNull: true,
                defaultValue: null,
            },
            type: {
                type: Sequelize.ENUM(Object.keys(CATEGORY_TYPES)),
                allowNull: false,
            },
            visibility: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            parent_id: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            branch_id: relationShip({
                modelName: "branches",
                key: "branch_id",
            }),
            children: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: null,
            },
            data: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: null,
            },
            ...migrationDefaults(),
        }, {
            collate: process.env.COLLATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('categories');
    }
};