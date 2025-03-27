'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      ...defaultKeys("role_id"),
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      branch_id: relationShip({
        modelName: "branches",
        key: "branch_id",
        allowNull: true,
      }),
      ...migrationDefaults(),
    }, {
      collate: process.env.COLLATE,
      // uniqueKeys: {
      //   name_branch_id_unique: {
      //     fields: ['name', 'branch_id'],
      //   },
      // },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('roles');
  }
};