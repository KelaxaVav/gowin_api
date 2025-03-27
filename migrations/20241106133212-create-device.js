'use strict';
const { defaultKeys, migrationDefaults, relationShip } = require('../sequelize/defaults');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('devices', {
      ...defaultKeys("device_id"),
      fcm_token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      platform: {
        type: Sequelize.ENUM(["ANDROID", "IOS", "WEB"]),
        allowNull: false,
      },
      user_id: relationShip({
        modelName: "users",
        key: "user_id",
      }),
      ...migrationDefaults({ paranoid: false }),
    }, {
      collate: process.env.COLLATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('devices');
  }
};