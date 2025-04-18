'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class RTOCategory extends Model {
    static associate(models) {
      // RTOCategory.belongsTo(models.State, {
      //   foreignKey: 'state_id',
      //   targetKey: 'state_id',
      //   as: 'state',
      // });
      RTOCategory.belongsTo(models.Insurer, {
        foreignKey: 'insurer_id',
        targetKey: 'insurer_id',
        as: 'insurer',
      });

      // RTO
      RTOCategory.belongsToMany(models.RTO, {
        through: models.RTORTOCategory,
        sourceKey: 'rto_category_id',
        foreignKey: 'rto_category_id',
        targetKey: 'rto_id',
        otherKey: 'rto_id',
        as: 'rtos',
      });
    }
  }
  RTOCategory.init({
    ...defaultKeys("rto_category_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'rto_category'));


  return RTOCategory;
};