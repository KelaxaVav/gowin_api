const { Op } = require("sequelize");
const { Asset, Category, Role, Position } = require("../models");
const { Validation, findModelAndThrow, findModelOrThrow } = require("../utils/validation");
const UserService = require("./user");

class AssetService {
    /**
     * Create a new asset
     * @param {{
     * type:string
     * owner_id:string
     * file:Express.Multer.File
     * }} param0 
     * @param {Extras} extras 
     */
    static async createAsset({ type, owner_id, file }, extras) {
        Validation.nullParameters([
            type,
            file,
        ]);

        const asset = await Asset.create({
            path: file.path,
            type,
            owner_id,
        }, { transaction: extras.transaction });

        return asset;
    }

    /**
     * Upsert asset
     * @param {{
     * asset:any
     * owner_id:string
     * type:string
     * file:Express.Multer.File
     * }} param0 
     * @param {Extras} extras 
     */
    static async upsertAsset({ asset, owner_id, type, file }, extras) {
        Validation.nullParameters([owner_id, file]);

        let upsertedAsset;
        if (asset) {
            upsertedAsset = await asset.update({ path: file.path }, { transaction: extras.transaction });
        }
        else {
            Validation.nullParameters([type]);

            upsertedAsset = asset = await Asset.create({
                path: file.path,
                type,
                owner_id,
            }, { transaction: extras.transaction });
        }

        return upsertedAsset;
    }
}

module.exports = AssetService;