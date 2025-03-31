'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
  class Staff extends Model {
    static associate(models) {

      Staff.belongsTo(models.Branch, {
        targetKey: 'branch_id',
        foreignKey: 'branch_id',
        as: 'branch',
      });

      Staff.belongsTo(models.Designation, {
        targetKey: 'designation_id',
        foreignKey: 'designation_id',
        as: 'designation',
      });

      Staff.belongsTo(models.Role, {
        targetKey: 'role_id',
        foreignKey: 'role_id',
        as: 'role',
      });

      Staff.belongsTo(models.Team, {
        targetKey: 'team_id',
        foreignKey: 'team_id',
        as: 'team',
      });

      Staff.belongsTo(models.City, {
        targetKey: 'city_id',
        foreignKey: 'city_id',
        as: 'city',
      });

      Staff.hasMany(models.Partner, {
        sourceKey: 'staff_id',
        foreignKey: 'staff_id',
        as: 'partners',
      });
    }
  }
  Staff.init({
    ...defaultKeys("staff_id"),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    blood_group: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    door_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // username: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    // password_hash: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    pin_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, modelDefaults(sequelize, 'staffs'));


  return Staff;
};