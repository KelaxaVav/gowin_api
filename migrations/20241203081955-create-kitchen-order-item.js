'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kitchen_order_items', {
      ...defaultKeys("kitchen_order_item_id"),
      branch_id: relationShip({
        modelName: "branches",
        key: "branch_id",
      }),
      item_id: relationShip({
        modelName: "items",
        key: "item_id",
      }),
      price: {
        type: Sequelize.DOUBLE.UNSIGNED,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.DOUBLE.UNSIGNED,
        allowNull: false,
      },
      delivery_at: {
        type: 'TIMESTAMP',
        allowNull: true,
        defaultValue: null,
      },
      ...migrationDefaults(),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('kitchen_order_items');
  }
};