'use strict';
const { Role } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const data = require('./data/roles.json');
      data.forEach((d, i) => {
        d.id = i + 2;
      });

      await Role.bulkCreate(data, {});
    } catch (error) {
      console.log(`error`, error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
