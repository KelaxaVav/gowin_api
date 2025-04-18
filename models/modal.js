'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Modal extends Model {
    static associate(models) {
      Modal.belongsTo(models.Make, {
        foreignKey: 'make_id',
        targetKey: 'make_id',
        as: 'make',
      });
      Modal.belongsTo(models.MakeModal, {
        foreignKey: 'make_modal_id',
        targetKey: 'make_modal_id',
        as: 'make_modal',
      });
    }
  }
  Modal.init({
    ...defaultKeys("modal_id"),
    modal_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gvw: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    cc: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    seater: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    kw: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'modals'));

  return Modal;
};