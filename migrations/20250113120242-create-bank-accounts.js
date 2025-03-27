'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bank_accounts', {
      ...defaultKeys("bank_account_id"),
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      account_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pan_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ifsc_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gst_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      aadhar_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      other_names: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      bank_id:relationShip({
        modelName: "banks",
        key: "bank_id",
      }),
      bank_account_type_id:relationShip({
        modelName: "bank_account_types",
        key: "bank_account_type_id",
      }),
      ...migrationDefaults(),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bank_accounts');
  }
};