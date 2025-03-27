'use strict';
const { Setting } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const data = require('./data/settings.json');

      await Setting.bulkCreate(data);
    } catch (error) {
      console.log(`error`, error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('settings', null, {});
  }
};
