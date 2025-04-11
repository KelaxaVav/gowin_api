'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class MakeModal extends Model {
    static associate(models) {
      MakeModal.belongsTo(models.Make, {
        foreignKey: 'make_id',
        targetKey: 'make_id',
        as: 'make',
      });
      MakeModal.hasMany(models.Modal, {
        foreignKey: 'make_modal_id',
        sourceKey: 'make_modal_id',
        as: 'modal',
      })
    }
  }
  MakeModal.init({
    ...defaultKeys("make_modal_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'make_modal'));


  return MakeModal;
};