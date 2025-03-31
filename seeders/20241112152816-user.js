'use strict';
const { User } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return

      const data = require('./data/users.json');
      data.forEach((d, i) => {
        d.id = i + 2;
      });

      await User.bulkCreate(data, {});
    } catch (error) {
      console.log(`error`, error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
