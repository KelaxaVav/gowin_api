'use strict';
const { Category } = require('../models');
const { findModelOrThrow } = require('../utils/validation');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const data = require('./data/categories.json');

      const posMenuCategory = await findModelOrThrow({ name: 'POS_MENU' }, Category);
      data.forEach((d, i) => {
        d.id = i + 5;

        if (d.parent_id == "PARENT_CATEGORY_ID") {
          d.parent_id = posMenuCategory.category_id;
        }
      });

      const customCake = await findModelOrThrow({ name: 'Custom Cake' }, Category);

      await customCake.update({
        children: [
          "d86aab09-bed0-4ddd-9058-840a5f6efaf9",
          "229aab02-2c61-460e-908a-1a5cf700cee3",
          "ddc4f0a5-3ee9-4d11-91c7-6e2321502d70",
          "1ac77640-e1ff-4183-b9ba-61b1d2737019"
        ],
      });

      await Category.bulkCreate(data, {});
    } catch (error) {
      console.log(`error`, error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
