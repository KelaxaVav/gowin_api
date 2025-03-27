const { Op } = require("sequelize");
const { ITEM_TYPES, SIGN } = require("../data/constants");
const { Item, Batch, Category, Asset } = require("../models");
const { findModelOrThrow, Validation, findModelAndThrow } = require("../utils/validation");
const CategoryService = require("../services/category");
const { v4 } = require("uuid");
const AssetService = require("./asset");
function validateCustomItemRecursive(customItem, customCategories) {
    Validation.isTrue(Object.keys(customItem).length);

    Object.keys(customItem).forEach(key => {
        const data = customItem[key];
        customCategories[key] = data.value;

        // if (data.children) {
        //     validateCustomItemRecursive(data.children, customCategories);
        // }
    });
}

class ItemService {
    static async validateCustomItem(branch_id, customItem) {
        const customCategories = {};
        validateCustomItemRecursive(customItem, customCategories);

        const findCategories = await Category.findAll({
            where: {
                [Op.or]: Object.keys(customCategories).map(key => ({
                    parent_id: key,
                    category_id: customCategories[key],
                    branch_id,
                })),
            }
        });

        Validation.isTrue(findCategories.length == Object.keys(customCategories).length);
    }

    /**
     * 
     * @param {string} branch_id 
     * @param {TInvoiceItem[]} invoiceItems 
     * @param {Extras} extras 
     */
    static async validateExistingItemsWithBranch(branch_id, invoiceItems, extras) {
        if (!invoiceItems.length) {
            return;
        }

        const uniqueItemIds = invoiceItems.reduce((data, iI) => {
            data[iI.item_id] = null;
            return data;
        }, {});

        const findItems = await Item.findAll({
            lock: true,
            transaction: extras.transaction,
            include: [
                {
                    model: Category,
                    as: 'category',
                },
            ],
            where: {
                '$category.branch_id$': branch_id,
                item_id: Object.keys(uniqueItemIds),
            },
        });
        Validation.isTrue(findItems.length == Object.keys(uniqueItemIds).length);
    }

    /**
     * 
     * @param {{
     * name:string
     * threshold:number
     * is_deliverable:boolean
     * branch_id:string
     * category_id:string
     * quantity:number
     * price:number
     * price_min:number
     * file:Express.Multer.File
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createItem({ name, unit, threshold, is_deliverable, branch_id, category_id, quantity, price, price_min, file }, extras) {
        Validation.nullParameters([name, category_id, file]);
        Validation.isTrue(price > 0);

        await findModelOrThrow({ category_id, branch_id }, Category);
        await findModelAndThrow({ name, category_id }, Item);

        const item = await Item.create({
            name,
            unit,
            threshold,
            type: ITEM_TYPES.GENERIC,
            is_deliverable,
            category_id,
            batches: [
                {
                    quantity,
                    price,
                    price_min,
                }
            ]
        }, {
            include: [{ model: Batch, as: 'batches' }],
            transaction: extras.transaction,
        });

        await AssetService.createAsset({ type: 'ITEM_IMAGE', owner_id: item.item_id, file }, extras);

        return item;
    }

    /**
     * 
     * @param {string} branch_id 
     * @param {TInvoiceItem[]} items 
     * @param {Extras} extras 
     * @returns 
     */
    static async createGenericItems(branch_id, items, extras) {
        if (!items.length) {
            return [];
        }

        const uncategorizedCategory = await CategoryService.findUncategorizedCategory(branch_id);

        const validateDuplicateNameWithCategory = [];
        const validateCategoryWithBranch = {};

        const itemData = items.map(item => {
            if (item.category_id) {
                validateCategoryWithBranch[item.category_id] = branch_id;
            } else {
                item.category_id = uncategorizedCategory.category_id;
            }

            item.batch_id = v4();
            const { price, quantity, category_id, name, unit, batch_id } = item;

            Validation.nullParameters([name]);
            Validation.isTrue(price > 0);
            Validation.isTrue(quantity > 0);
            validateDuplicateNameWithCategory.push({ name, category_id });

            const newItem = {
                name,
                unit,
                type: ITEM_TYPES.GENERIC,
                category_id,
                batches: [
                    {
                        batch_id,
                        price,
                    }
                ],
            };

            return newItem;
        });

        if (Object.keys(validateCategoryWithBranch).length) {
            const uniqueCategoriesArray = Object.keys(validateCategoryWithBranch).map(key => ({
                category_id: key,
                branch_id: validateCategoryWithBranch[key],
            }));

            const findCategories = await Category.findAll({
                where: { [Op.or]: uniqueCategoriesArray }
            });

            Validation.isTrue(findCategories.length == uniqueCategoriesArray.length);
        }

        await findModelAndThrow({ [Op.or]: validateDuplicateNameWithCategory, }, Item);

        const newItems = await Item.bulkCreate(itemData, {
            include: [{ model: Batch, as: 'batches', }],
            transaction: extras.transaction,
        });

        return newItems;
    }

    /**
     * 
     * @param {string} branch_id 
     * @param {TInvoiceItem[]} items 
     * @param {Extras} extras 
     */
    static async createCustomItems(branch_id, items, extras) {
        if (!items.length) {
            return [];
        }

        await Promise.all(items.map(item => this.validateCustomItem(branch_id, item.customItem)));

        const { category_id } = await CategoryService.findCustomPresetCategory(branch_id);

        const customItemData = items.map(item => {
            item.batch_id = v4();
            const { price, customItem, batch_id, quantity } = item;

            Validation.isTrue(price > 0);

            /** @type {TItem} */
            const newItem = {
                name: "Custom",
                type: ITEM_TYPES.CUSTOM,
                customItem,
                category_id,
                batches: [
                    {
                        batch_id,
                        price,
                        sign: SIGN.NEGATIVE,
                        quantity,
                    }
                ],
            }

            return newItem;
        });

        await Item.bulkCreate(customItemData, {
            include: [{ model: Batch, as: 'batches', }],
            transaction: extras.transaction,
        });
    }

    /**
     * 
     * @param {{
     * item_id:string
     * name:string
     * unit:string
     * threshold:number
     * is_deliverable:boolean
     * branch_id:string
     * category_id:string
     * file:Express.Multer.File
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async updateItem({ item_id, name, unit, threshold, is_deliverable, category_id, branch_id, file }, extras) {
        Validation.nullParameters([name, unit, threshold, category_id]);

        const item = await findModelOrThrow({ item_id }, Item, {
            include: [
                {
                    model: Category,
                    as: 'category',
                },
                {
                    model: Asset,
                    as: 'image',
                },
            ],
        });
        Validation.authority(branch_id, item.category.branch_id);

        if (item.type == ITEM_TYPES.GENERIC) {
            await findModelAndThrow({
                name,
                item_id: { [Op.not]: item_id },
                category_id: category_id ?? item.category_id
            }, Item);
        }

        if (category_id) {
            await findModelOrThrow({ category_id, branch_id }, Category);
        }

        if (file) {
            await AssetService.upsertAsset({
                asset: item.image,
                owner_id: item.item_id,
                file,
                type: 'ITEM_IMAGE',
            }, extras);
        }

        await item.update({
            name,
            unit,
            threshold,
            is_deliverable,
            category_id: item.type == ITEM_TYPES.GENERIC ? category_id : undefined,
        }, { transaction: extras.transaction });

        return item;
    }

    /**
     * Bulk update **custom** items with batch
     * @param {string} branch_id 
     * @param {TInvoiceItem[]} iItems 
     * @param {Extras} extras 
     * @returns 
     */
    static async updateCustomItems(branch_id, iItems, extras) {
        await Promise.all(iItems.map(async iItem => {
            const { customItem, price, batch, quantity, kitchenOrder } = iItem;
            Validation.isTrue(price > 0);
            await this.validateCustomItem(branch_id, customItem);

            await batch.item.update({
                customItem,
            }, { transaction: extras.transaction });

            await batch.update({
                price,
                quantity,
            }, { transaction: extras.transaction });
        }));
    }

    /**
     * 
     * @param {{
     * item_id:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteItem({ item_id, branch_id }, extras) {
        const item = await findModelOrThrow({ item_id }, Item, {
            include: [
                {
                    model: Batch,
                    as: 'batches',
                },
                {
                    model: Category,
                    as: 'category'
                }
            ],
            throwOnDeleted: true,
            messageOnDeleted: "Item is already deleted",
        });
        Validation.authority(branch_id, item.category.branch_id);

        await item.destroy({ transaction: extras.transaction });
    }
}

module.exports = ItemService;