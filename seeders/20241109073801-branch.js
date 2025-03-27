'use strict';
const { Branch } = require('../models');
const BranchService = require('../services/branch');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const data = require('./data/branches.json');

      // 
      // await Branch.bulkCreate(data, {});

      for (let i = 0; i < data.length; i++) {
        const branch = data[i];

        await BranchService.createBranch({
          branch_id: '9ec72f38-2534-49e3-99d6-d9250961b5a5',
          name: branch.name,
          address: branch.address,
          code: branch.code,
          contact: branch.contact,
          settings: branch.settings,
        }, { transaction: null });
      }

    } catch (error) {
      console.log(`error`, error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('branches', null, {});
  }
};
