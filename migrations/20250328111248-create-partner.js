'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('partners', {
      ...defaultKeys("partner_id"),
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mobile_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      door_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      street: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pin_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      city_id: relationShip({
        modelName: "cities",
        key: "city_id",
      }),
      staff_id: relationShip({
        modelName: "staffs",
        key: "staff_id",
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
    await queryInterface.dropTable('partners');
  }
};