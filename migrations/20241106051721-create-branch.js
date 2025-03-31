'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('branches', {
      ...defaultKeys("branch_id"),
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        // unique: true,
      },
      region_id: relationShip({
        modelName: "regions",
        key: "region_id",
        allowNull: false,
      }),
      ...migrationDefaults(),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('branches');
  }
};