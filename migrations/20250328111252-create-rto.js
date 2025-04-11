'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rto', {
      ...defaultKeys("rto_id"),
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state_id: relationShip({
        modelName: "states",
        key: "state_id",
      }),
      rto_category_id: relationShip({
        modelName: "rto_category",
        key: "rto_category_id",
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
    await queryInterface.dropTable('rto');
  }
};