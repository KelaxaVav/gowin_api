'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('policies', {
      ...defaultKeys("policy_id"),
      policy_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      chassis_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      yom: {
        type: Sequelize.STRING(4),
        allowNull: true,
      },
      cpa: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gvw: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cc: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      seating: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      kw: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      odp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      net_premium: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      issued_date: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
      tp_start_date: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
      od_start_date: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
      insured_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mobile_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      make_id: relationShip({
        key: 'make_id',
        modelName: 'makes',
        allowNull: true,
      }),
      make_modal_id: relationShip({
        key: 'make_modal_id',
        modelName: 'make_modal',
        allowNull: true,
      }),
      rto_id: relationShip({
        key: 'rto_id',
        modelName: 'rto',
        allowNull: true,
      }),
      product_id: relationShip({
        key: 'product_id',
        modelName: 'products',
        allowNull: true,
      }),
      partner_id: relationShip({
        key: 'partner_id',
        modelName: 'partners',
        allowNull: true,
      }),
      loginId_id: relationShip({
        key: 'loginId_id',
        modelName: 'login_id',
        allowNull: true,
      }),
      reg_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tpp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gross_premium: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      reg_date: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
      tp_expiry_date: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
      od_expiry_date: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
      ...migrationDefaults(),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('policies');
  }
};