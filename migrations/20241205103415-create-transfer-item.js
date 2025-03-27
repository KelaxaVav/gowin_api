'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transfer_items', {
      ...defaultKeys("transfer_item_id"),
      batch_id: relationShip({
        modelName: "batches",
        key: "batch_id",
      }),
      transferred_as: relationShip({
        modelName: "batches",
        key: "batch_id",
        allowNull: null,
      }),
      quantity: {
        type: Sequelize.DOUBLE.UNSIGNED,
        allowNull: false,
      },
      transfer_id: relationShip({
        modelName: "transfers",
        key: "transfer_id",
      }),
      ...migrationDefaults({ paranoid: false }),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transfer_items');
  }
};