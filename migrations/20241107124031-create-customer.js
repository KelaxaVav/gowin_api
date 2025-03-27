'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('customers', {
            ...defaultKeys("customer_id"),
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            mobile: {
                type: Sequelize.STRING,

            },
            rewards: {
                type: Sequelize.DOUBLE.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            branch_id: relationShip({
                modelName: "branches",
                key: "branch_id",
            }),
            ...migrationDefaults(),
        }, {
            collate: process.env.COLLATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('customers');
    }
};