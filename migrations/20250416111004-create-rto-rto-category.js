'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rto_rto_category', {
      ...defaultKeys("rto_rto_category_id"),
      rto_id: relationShip({
        key: 'rto_id',
        modelName: 'rto'
      }),
      rto_category_id: relationShip({
        key: 'rto_category_id',
        modelName: 'rto_category'
      }),
      ...migrationDefaults({ paranoid: false }),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rto_rto_category');
  }
};