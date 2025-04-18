'use strict';
const { Product } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const data = require('./data/products.json');

      await Product.bulkCreate(data, {});
    } catch (error) {
      console.log(`error`, error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
  }
};
