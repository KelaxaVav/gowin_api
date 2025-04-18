'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class RTORTOCategory extends Model {
    static associate(models) {

    }
  }
  RTORTOCategory.init({
    ...defaultKeys("rto_rto_category_id"),
  }, modelDefaults(sequelize, 'rto_rto_category', { paranoid: false }));


  return RTORTOCategory;
};