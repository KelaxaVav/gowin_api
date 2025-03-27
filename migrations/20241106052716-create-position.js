'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('positions', {
      ...defaultKeys("position_id"),
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      branch_id: relationShip({
        modelName: "branches",
        key: "branch_id",
      }),
      ...migrationDefaults(),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('positions');
  }
};