'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('staffs', 'team_id', relationShip({
      modelName: "teams",
      key: "team_id",
      allowNull: true,
    }), {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('teams', 'team_id');
  }
};