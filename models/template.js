'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { TEMPLATE_TYPES } = require('../data/constants');
module.exports = (sequelize) => {
  class Template extends Model {
    static associate(models) {
      // Branch
      Template.belongsTo(models.Branch, {
        targetKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'branch',
      });
    }
  }
  Template.init({
    ...defaultKeys("template_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(Object.keys(TEMPLATE_TYPES)),
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'templates'));
  return Template;
};