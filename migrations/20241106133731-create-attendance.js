'use strict';
const { ATTENDANCE_STATUSES } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('attendances', {
            ...defaultKeys("attendance_id"),
            status: {
                type: Sequelize.ENUM(Object.keys(ATTENDANCE_STATUSES)),
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
            user_id: relationShip({
                modelName: "users",
                key: "user_id",
            }),
            leave_request_id: relationShip({
                modelName: "leave_requests",
                key: "leave_request_id",
                allowNull: true,
                unique: true,
            }),
            ...migrationDefaults(),
        }, {
            collate: process.env.COLLATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('attendances');
    }
};