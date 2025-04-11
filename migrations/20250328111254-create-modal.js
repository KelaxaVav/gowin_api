'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('modals', {
      ...defaultKeys("modal_id"),
      modal_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gvw: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cc: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      seater: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      kw: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      make_id: relationShip({
        modelName: "makes",
        key: "make_id",
      }),
      make_modal_id: relationShip({
        modelName: "make_modal",
        key: "make_modal_id",
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
    await queryInterface.dropTable('modals');
  }
};