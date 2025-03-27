const { DataTypes, Sequelize, Model } = require("sequelize");
require('dotenv').config();

const defaultKeys = (name) => {
    return {
        id: {
            allowNull: false,
            autoIncrement: true,
            unique: true,
            type: DataTypes.INTEGER.UNSIGNED
        },
        [name]: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
    };
};

const migrationDefaults = (options = { withUser: false, isUser: false, paranoid: true }) => {
    const withUser = options.withUser ?? false;
    const isUser = options.isUser ?? false;
    const paranoid = options.paranoid ?? true;

    const defaultColumns = {
        created_at: {
            type: 'TIMESTAMP',
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
            type: 'TIMESTAMP',
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
    };

    if (paranoid) {
        defaultColumns['deleted_at'] = {
            type: 'TIMESTAMP',
            allowNull: true,
            defaultValue: null,
        };
    }

    if (withUser) {
        defaultColumns['created_by'] = {
            type: DataTypes.STRING,
            allowNull: isUser,
            references: {
                key: 'user_id',
                model: 'users',
            },
        };
        defaultColumns['updated_by'] = {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            references: {
                key: 'user_id',
                model: 'users',
            },
        };
        if (paranoid) {
            defaultColumns['deleted_by'] = {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null,
                references: {
                    key: 'user_id',
                    model: 'users',
                },
            };
        }
    }

    return defaultColumns;
};

/** @param {typeof Model} model * @param {*} models * @param {boolean} isUser */
const actionUsers = (model, models, isUser = false) => {
    model.belongsTo(models.User, {
        targetKey: 'user_id',
        foreignKey: {
            name: 'created_by',
            allowNull: isUser,
        },
        as: 'userCreated',
    });
    model.belongsTo(models.User, {
        targetKey: 'user_id',
        foreignKey: {
            name: 'updated_by',
            allowNull: true,
        },
        as: 'userUpdated',
    });
    if (model.options.paranoid) {
        model.belongsTo(models.User, {
            targetKey: 'user_id',
            foreignKey: {
                name: 'deleted_by',
                allowNull: true,
            },
            as: 'userDeleted',
        });
    }
}

/** 
 * @param {Sequelize} sequelize 
 * @param {string} tableName
 * @param {import("sequelize").InitOptions} options
 * @returns
 */
const modelDefaults = (sequelize, tableName, options = {}) => {
    const defaultConfig = {
        paranoid: true,
        collate: process.env.COLLATE,
    };

    const initConfig = {
        sequelize,
        tableName,
        createdAt: "created_at",
        updatedAt: "updated_at",
        ...defaultConfig,
        ...options,
    };

    if (initConfig.paranoid) {
        initConfig.deletedAt = 'deleted_at';
    }
    return initConfig;
};


const relationShip = ({ modelName, key, allowNull = false, unique = false, onDelete = "CASCADE", onUpdate = "CASCADE" }) => {
    return {
        type: DataTypes.STRING,
        allowNull: allowNull,
        onDelete: onDelete,
        onUpdate: onUpdate,
        references: {
            key: key,
            model: modelName,
        },
        unique: unique,
    };
};

module.exports = {
    defaultKeys,
    migrationDefaults,
    modelDefaults,
    relationShip,
    actionUsers,
};