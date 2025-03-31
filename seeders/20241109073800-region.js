'use strict';
const { Branch, Region } = require('../models');
const BranchService = require('../services/branch');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await Region.create({
        region_id: '05bb3569-ac37-497c-95bb-17d1adcb851a',
        name: "Test Region Don't Delete",
      });

    } catch (error) {
      console.log(`error`, error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('regions', null, {});
  }
};
