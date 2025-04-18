'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      ...defaultKeys("product_id"),
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pdf_type: {
        type: Sequelize.STRING,
        allowNull: null,
      },
      tp_duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cc: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      gvw: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      kw: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      seat: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      age: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      make_modal_id: relationShip({
        modelName: "make_modal",
        key: "make_modal_id",
        allowNull: true,
      }),
      insurer_id: relationShip({
        modelName: "insurers",
        key: "insurer_id",
        allowNull: true,
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
    await queryInterface.dropTable('products');
  }
};