'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('claims', {
      ...defaultKeys("claim_id"),
      claim_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      intimate_by: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      accident_date: {
        type: 'TIMESTAMP',
        allowNull: false,
      },
      claim_intimation_date: {
        type: 'TIMESTAMP',
        allowNull: false,
      },
      surveyar_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      surveyar_mobile: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      claim_approval_date: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
      claim_settled_date: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
      document_submitted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      bill_amount: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      liablity_amount: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      settle_net_amount: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      settle_gst_amount: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      settle_total_amount: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      policy_id: relationShip({
        key: 'policy_id',
        modelName: 'policies',
      }),
      ...migrationDefaults(),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('claims');
  }
};