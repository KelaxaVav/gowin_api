'use strict';
const { Transaction } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const data = require('./data/transactions.json');
      data.forEach(d => {
        d.date = new Date();
      });

      await Transaction.bulkCreate(data);
    } catch (error) {
      console.log(`error`, error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('transactions', null, {});
  }
};
