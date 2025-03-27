'use strict';
const { Vendor } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const data = require('./data/vendors.json');
      data.forEach((d, i) => {
        d.id = i + 1;
      });

      await Vendor.bulkCreate(data, {});
    } catch (error) {
      console.log(`error`, error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('vendors', null, {});
  }
};
