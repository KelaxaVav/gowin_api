'use strict';
const { defaultKeys, migrationDefaults } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permissions', {
      ...defaultKeys("permission_id"),
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      ...migrationDefaults(),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permissions');
  }
};