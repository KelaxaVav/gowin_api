'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('make_modal', {
      ...defaultKeys("make_modal_id"),
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      make_id: relationShip({
        modelName: "makes",
        key: "make_id",
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
    await queryInterface.dropTable('make_modal');
  }
};