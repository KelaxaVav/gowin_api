'use strict';
const { TEMPLATE_TYPES } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('templates', {
            ...defaultKeys("template_id"),
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.ENUM(Object.keys(TEMPLATE_TYPES)),
                allowNull: false,
            },
            branch_id: relationShip({
                modelName: "branches",
                key: "branch_id",
                allowNull: true,
            }),
            status: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            data: {
                type: Sequelize.JSON,
                allowNull: false,
            },
            ...migrationDefaults(),
        }, {
            collate: process.env.COLLATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('templates');
    }
};