'use strict';
const { ACC_HOLDER_TYPES } = require('../data/constants');
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bank_accounts', {
      ...defaultKeys("bank_account_id"),
      acc_name: {
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
      others: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mobile: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tan_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
     
      user_type: {
        type: Sequelize.ENUM(Object.keys(ACC_HOLDER_TYPES)),
        allowNull: false,
      },
      loginId_id: relationShip({
        modelName: "login_id",
        key: "loginId_id",
        allowNull: true,
      }),
      bank_id:relationShip({
        modelName: "banks",
        key: "bank_id",
      }),
      bank_account_type_id:relationShip({
        modelName: "bank_account_types",
        key: "bank_account_type_id",
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
    await queryInterface.dropTable('bank_accounts');
  }
};