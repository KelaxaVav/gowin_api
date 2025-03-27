'use strict';
const { TRANSFER_TYPES, TRANSFER_STATUSES } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transfers', {
      ...defaultKeys("transfer_id"),
      transfer_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(Object.keys(TRANSFER_TYPES)),
        allowNull: false,
      },
      transfer_from: relationShip({
        modelName: "branches",
        key: "branch_id",
      }),
      transfer_to: relationShip({
        modelName: "branches",
        key: "branch_id",
        allowNull: true,
      }),
      transferred_at: {
        type: 'TIMESTAMP',
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: Sequelize.ENUM(Object.keys(TRANSFER_STATUSES)),
        allowNull: false,
      },
      ...migrationDefaults(),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transfers');
  }
};