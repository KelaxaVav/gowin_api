'use strict';
const PERMISSIONS = require('../data/permissions');
const { RolePermission, Role } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // const roles = require('./data/roles.json');

      const role = await Role.findOne();

      const data = [];
      Object.keys(PERMISSIONS).forEach(key => {

        // roles.forEach(role => {
        data.push({
          role_id: role.role_id,
          permission_id: PERMISSIONS[key],
        });
      });
      // });

      await RolePermission.bulkCreate(data);
    } catch (error) {
      console.log(`error`, error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('role_permissions', null, {});
  }
};
