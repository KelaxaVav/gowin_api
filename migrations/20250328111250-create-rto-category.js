'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rto_category', {
      ...defaultKeys("rto_category_id"),
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state_id: relationShip({
        modelName: "states",
        key: "state_id",
      }),
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
    await queryInterface.dropTable('rto_category');
  }
};