'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('salaries', {
            ...defaultKeys("salary_id"),
            user_id: relationShip({
                modelName: "users",
                key: "user_id",
            }),
            month: {
                type: Sequelize.STRING(6),
                allowNull: false,
            },
            note: {
                type: Sequelize.STRING,
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
        await queryInterface.dropTable('salaries');
    }
};