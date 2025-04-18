'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
const { GENERAL_TYPES } = require('../data/constants');
module.exports = (sequelize) => {
  class Claim extends Model {
    static associate(models) {
      Claim.belongsTo(models.Policy, {
        foreignKey: 'policy_id',
        targetKey: 'policy_id',
        as: 'policy',
      });
    }
  }
  Claim.init({
    ...defaultKeys("claim_id"),
    claim_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    intimate_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accident_date: {
      type: 'TIMESTAMP',
      allowNull: false,
    },
    claim_intimation_date: {
      type: 'TIMESTAMP',
      allowNull: false,
    },
    surveyar_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    surveyar_mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    claim_approval_date: {
      type: 'TIMESTAMP',
      allowNull: true,
    },
    claim_settled_date: {
      type: 'TIMESTAMP',
      allowNull: true,
    },
    document_submitted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    bill_amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    liablity_amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    settle_net_amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    settle_gst_amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    settle_total_amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'claims'));


  return Claim;
};