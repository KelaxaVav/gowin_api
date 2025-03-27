'use strict';
const { WEEKDAYS, HOLIDAY_TYPES, HOLIDAY_LEAVE_TYPES, SCOPE_TYPES } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('holidays', {
            ...defaultKeys("holiday_id"),
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            leave_type: {
                type: Sequelize.ENUM(Object.keys(HOLIDAY_LEAVE_TYPES)),
                allowNull: false,
            },
            day: {
                type: Sequelize.ENUM(Object.keys(WEEKDAYS)),
                allowNull: true,
            },
            type: {
                type: Sequelize.ENUM(Object.keys(HOLIDAY_TYPES)),
                allowNull: false,
            },
            branch_id: relationShip({
                modelName: "branches",
                key: "branch_id",
                allowNull: true,
            }),
            ...migrationDefaults(),
        }, {
            collate: process.env.COLLATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('holidays');
    }
};