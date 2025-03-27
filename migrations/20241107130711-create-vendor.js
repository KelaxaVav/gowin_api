'use strict';
const { VENDOR_STATUSES } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('vendors', {
            ...defaultKeys("vendor_id"),
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                // unique: true,
            },
            branch_id: relationShip({
                modelName: "branches",
                key: "branch_id",
                allowNull: true,
            }),
            mobile: {
                type: Sequelize.STRING,
                allowNull: false,
                // unique: true,
            },
            status: {
                type: Sequelize.ENUM(Object.keys(VENDOR_STATUSES)),
                allowNull: false,
                defaultValue: "ACTIVE",
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
        await queryInterface.dropTable('vendors');
    }
};