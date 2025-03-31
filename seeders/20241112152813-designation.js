'use strict';
const { Position } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return

      const data = require('./data/positions.json');

      await Position.bulkCreate(data);
    } catch (error) {
      console.log(`error`, error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('designations', null, {});
  }
};
