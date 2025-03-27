'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('expenses_entry', {
      ...defaultKeys("expenses_entry_id"),
      entry_date: {
        type: "TIMESTAMP",
        allowNull: false,
      },
      expenses_id: relationShip({
        modelName: "expenses",
        key: "expenses_id",
      }),
      expenses_category_id: relationShip({
        modelName: "expenses_category",
        key: "expenses_category_id",
      }),
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      taxes: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      ...migrationDefaults(),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('expenses_entry');
  }
};