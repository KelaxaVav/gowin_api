'use strict';
const PERMISSIONS = require('../data/permissions');
const { name } = require('../firebase');
const { Permission } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const data = [];
      Object.keys(PERMISSIONS).forEach(key => {
        data.push({
          name: key,
          permission_id: PERMISSIONS[key],
        });
      });

      await Permission.bulkCreate(data);
    } catch (error) {
      console.log(`error`, error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
