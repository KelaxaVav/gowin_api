'use strict';
const { TRANSACTION_ENTITY_TYPES, TRANSACTION_STATUSES, TRANSACTION_REASONS, TRANSACTION_METHODS } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      ...defaultKeys("transaction_id"),
      entity_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      entity_type: {
        type: Sequelize.ENUM(Object.keys(TRANSACTION_ENTITY_TYPES)),
        allowNull: false,
      },
      branch_id: relationShip({
        modelName: "branches",
        key: "branch_id",
      }),
      reason: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: 'TIMESTAMP',
        allowNull: false,
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      method: {
        type: Sequelize.ENUM(Object.keys(TRANSACTION_METHODS)),
        allowNull: false,
        defaultValue: TRANSACTION_METHODS.CASH,
      },
      status: {
        type: Sequelize.ENUM(Object.keys(TRANSACTION_STATUSES)),
        allowNull: false,
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      ...migrationDefaults(),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};