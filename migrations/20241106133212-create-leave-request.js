'use strict';
const { LEAVE_REQUEST_TYPES, LEAVE_REQUEST_STATUSES, LEAVE_REQUEST_PURPOSES } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('leave_requests', {
            ...defaultKeys("leave_request_id"),
            user_id: relationShip({
                modelName: "users",
                key: "user_id",
            }),
            type: {
                type: Sequelize.ENUM(Object.keys(LEAVE_REQUEST_TYPES)),
                allowNull: false,
            },
            purpose: {
                type: Sequelize.ENUM(Object.keys(LEAVE_REQUEST_PURPOSES)),
                allowNull: false,
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            start_at: {
                type: Sequelize.TIME,
                allowNull: true,
                defaultValue: null,
            },
            end_at: {
                type: Sequelize.TIME,
                allowNull: true,
                defaultValue: null,
            },
            status: {
                type: Sequelize.ENUM(Object.keys(LEAVE_REQUEST_STATUSES)),
                allowNull: false,
                defaultValue: LEAVE_REQUEST_STATUSES.PENDING,
            },
            ...migrationDefaults(),
        }, {
            collate: process.env.COLLATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('leave_requests');
    }
};