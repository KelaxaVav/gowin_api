'use strict';
const { FROZEN_BATCH_TYPE } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('frozen_batches', {
      ...defaultKeys("frozen_batch_id"),
      batch_id: relationShip({
        modelName: "batches",
        key: "batch_id",
      }),
      owner_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.ENUM(Object.keys(FROZEN_BATCH_TYPE)),
        allowNull: false,
      },
      quantity: {
        type: Sequelize.DOUBLE.UNSIGNED,
        allowNull: false,
      },
      ...migrationDefaults({ paranoid: false }),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('frozen_batches');
  }
};