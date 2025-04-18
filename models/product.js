'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.MakeModal, {
        foreignKey: 'make_modal_id',
        targetKey: 'make_modal_id',
        as: 'make_modal',
      });

      Product.belongsTo(models.Insurer, {
        foreignKey: 'insurer_id',
        targetKey: 'insurer_id',
        as: 'insurer',
      });
    }
  }

  Product.init({
    ...defaultKeys("product_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pdf_type: {
      type: DataTypes.STRING,
      allowNull: null,
    },
    tp_duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cc: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    gvw: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    kw: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    seat: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    age: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'products'));

  return Product;
};