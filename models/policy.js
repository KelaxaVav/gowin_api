'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');

module.exports = (sequelize) => {
  class Policy extends Model {
    static associate(models) {
      Policy.belongsTo(models.Make, {
        foreignKey: 'make_id',
        targetKey: 'make_id',
        as: 'make',
      });

      Policy.belongsTo(models.MakeModal, {
        foreignKey: 'make_modal_id',
        targetKey: 'make_modal_id',
        as: 'makeModal',
      });

      Policy.belongsTo(models.RTO, {
        foreignKey: 'rto_id',
        targetKey: 'rto_id',
        as: 'rto',
      });

      Policy.belongsTo(models.LoginId, {
        foreignKey: 'loginId_id',
        targetKey: 'loginId_id',
        as: 'loginId',
      });

      Policy.belongsTo(models.Partner, {
        foreignKey: 'partner_id',
        targetKey: 'partner_id',
        as: 'partner',
      });

      Policy.belongsTo(models.Product, {
        foreignKey: 'product_id',
        targetKey: 'product_id',
        as: 'product',
      });
    }
  }
  Policy.init({
    ...defaultKeys("policy_id"),
    policy_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    chassis_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    yom: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
    cpa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gvw: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cc: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    seating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kw: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    odp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    net_premium: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    issued_date: {
      type: 'TIMESTAMP',
      allowNull: true,
    },
    tp_start_date: {
      type: 'TIMESTAMP',
      allowNull: true,
    },
    od_start_date: {
      type: 'TIMESTAMP',
      allowNull: true,
    },
    insured_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    insured_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reg_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tpp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gross_premium: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reg_date: {
      type: 'TIMESTAMP',
      allowNull: true,
    },
    tp_expiry_date: {
      type: 'TIMESTAMP',
      allowNull: true,
    },
    od_expiry_date: {
      type: 'TIMESTAMP',
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    },
  }, modelDefaults(sequelize, 'policies'));

  return Policy;
};