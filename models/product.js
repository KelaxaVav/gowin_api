'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Modal extends Model {
    static associate(models) {
      Modal.belongsTo(models.MakeModal, {
        foreignKey: 'make_modal_id',
        targetKey: 'make_modal_id',
        as: 'make_modal',
      });
      
      Modal.belongsTo(models.Insurer, {
        foreignKey: 'insurer_id',
        targetKey: 'insurer_id',
        as: 'insurer',
      });
    }
  }
  Modal.init({
    ...defaultKeys("product_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'products'));


  return Modal;
};