'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('login_id', {
      ...defaultKeys("loginId_id"),
      loginId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      insurer_id: relationShip({
        modelName: "insurers",
        key: "insurer_id",
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
    await queryInterface.dropTable('login_id');
  }
};