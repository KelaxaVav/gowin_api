'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teams', {
      ...defaultKeys("team_id"),
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      staff_id: relationShip({
        modelName: "staffs",
        key: "staff_id",
        allowNull: true,
      }),
      branch_id: relationShip({
        modelName: "branches",
        key: "branch_id",
      }),
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
    await queryInterface.dropTable('teams');
  }
};