'use strict';
const { KITCHEN_ORDER_STATUSES, KITCHEN_ORDER_TYPES } = require('../data/constants');
const { defaultKeys, migrationDefaults } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kitchen_orders', {
      ...defaultKeys("kitchen_order_id"),
      entity_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(Object.keys(KITCHEN_ORDER_TYPES)),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(Object.keys(KITCHEN_ORDER_STATUSES)),
        allowNull: false,
        defaultValue: KITCHEN_ORDER_STATUSES.PENDING,
      },
      ...migrationDefaults(),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('kitchen_orders');
  }
};