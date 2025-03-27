'use strict';
const { Model, DataTypes } = require('sequelize');
const { defaultKeys, modelDefaults } = require('../sequelize/defaults');
module.exports = (sequelize) => {
    class SampleModel extends Model {
        static associate(models) {

        }
    }
    SampleModel.init({
        ...defaultKeys("sample_model_id"),
        fcm_token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        platform: {
            type: DataTypes.ENUM(["ANDROID", "IOS", "WEB"]),
            allowNull: false,
        },
    }, modelDefaults(sequelize, 'sample_models'));
    return SampleModel;
};