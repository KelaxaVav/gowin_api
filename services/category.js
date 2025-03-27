const { Op, Sequelize } = require("sequelize");
const { CATEGORY_TYPES, BRANCH_CATEGORIES } = require("../data/constants");
const { Category, Item, Asset } = require("../models");
const { findModelOrThrow, Validation, findModelAndThrow } = require("../utils/validation");
const { firstLetterCapital } = require("../utils/utility");
const AssetService = require("./asset");

function setChildren(category, categoryData) {
    if (category.type == 'CUSTOM' && category.children) {
        const children = category.children.map(c => {
            if (typeof c != 'string') {
                return c;
            }
            const data = categoryData[c];
            setChildren(data, categoryData);
            return data;
        });
        category.children = children;
    }
    if (category.type == 'OPTION' && category.options) {
        const options = category.options.map(o => {
            const data = categoryData[o.category_id];
            setChildren(data, categoryData);
            return data;
        });
        category.options = options;
    }
}

class CategoryService {
    /**
     * 
     * @param {{
     * name:string
     * branch_id:string
     * visibility:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createItemCategory({ name, branch_id, visibility }, extras) {
        Validation.nullParameters([name, branch_id, visibility]);
        Validation.isTrue(!BRANCH_CATEGORIES.includes(name), {
            message: 'Cannot create default categories',
        });

        await findModelAndThrow({ name, branch_id }, Category);

        const posMenu = await this.findCategoryByName('POS_MENU', branch_id);

        const category = await Category.create({
            name,
            branch_id,
            parent_id: posMenu.category_id,
            visibility,
            type: CATEGORY_TYPES.ITEM,
        }, { transaction: extras.transaction });
        return category;
    }

    /**
     * 
     * @param {{
     * name:string
     * price:number
     * branch_id:string
     * visibility:boolean
     * options:TOptionCategory[]
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createOptionCategory({ name, price, branch_id, visibility, options }, extras) {
        Validation.nullParameters([name, branch_id]);
        Validation.isTrue(options.length);
        await findModelAndThrow({ name, branch_id }, Category);

        if (typeof price == 'number') {
            Validation.isTrue(price > 0);
        }

        const names = {};
        const optionData = options.map(option => {
            const { name, price } = option;
            Validation.nullParameters([name]);

            if (typeof price == 'number') {
                Validation.isTrue(price > 0);
            }

            names[name.toLowerCase()] = 1;

            /** @type {TCustomCategory} */
            const newOption = {
                branch_id,
                name,
                price,
            };

            return newOption;
        });

        Validation.isTrue(Object.keys(names).length == options.length, {
            message: 'Duplicate names found in options'
        });

        const category = await Category.create({
            name,
            price,
            branch_id,
            visibility,
            type: CATEGORY_TYPES.OPTION,
            options: optionData,
        }, {
            include: [
                {
                    model: Category,
                    as: 'options',
                },
            ],
            transaction: extras.transaction,
        });
        return category;
    }

    /**
     * 
     * @param {{
     * name:string
     * branch_id:string
     * parent_id:string
     * price:number
     * visibility:boolean
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createCustomCategory({ name, branch_id, parent_id, price, visibility }, extras) {
        Validation.nullParameters([name, branch_id, parent_id]);
        await findModelOrThrow({ category_id: parent_id, branch_id, type: CATEGORY_TYPES.OPTION }, Category);
        await findModelAndThrow({ name, branch_id, parent_id }, Category);

        if (typeof price == 'number') {
            Validation.isTrue(price > 0);
        }

        const category = await Category.create({
            name,
            price,
            type: CATEGORY_TYPES.CUSTOM,
            visibility,
            parent_id,
            branch_id,
        }, { transaction: extras.transaction });
        return category;
    }

    /**
     * 
     * @param {{
     * name:string
     * branch_id:string
     * options:TOptionCategory[]
     * parent_id?:string
     * price?:number
     * type:'ITEM'|'OPTION'|'CUSTOM'
     * visibility?:'SHOW'|'HIDE'
     * file:Express.Multer.File
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async createCategory({ name, branch_id, options, parent_id, price, type, visibility, file }, extras) {
        let category;
        if (type == CATEGORY_TYPES.ITEM) {
            category = await this.createItemCategory({ branch_id, name, visibility }, extras);
        } else if (type == CATEGORY_TYPES.OPTION) {
            category = await this.createOptionCategory({ branch_id, name, options, price, visibility }, extras);
        } else if (type == CATEGORY_TYPES.CUSTOM) {
            category = await this.createCustomCategory({ branch_id, name, parent_id, price, visibility }, extras);
        } else {
            Validation.isTrue(0);
        }

        if (file) {
            await AssetService.createAsset({ type: 'CATEGORY_IMAGE', owner_id: category.category_id, file }, extras);
        }

        return category;
    }

    /**
     * 
     * @param {{
     * category_id:string
     * branch_id:string
     * name:string
     * price:string
     * visibility:boolean
     * file:Express.Multer.File
     * }} param0 
     * @param {*} extras 
     * @returns 
     */
    static async updateCategory({ category_id, branch_id, name, price, visibility, file }, extras) {
        const category = await findModelOrThrow({ category_id }, Category);
        Validation.authority(branch_id, category.branch_id);

        if (name) {
            Validation.emptyStringParameters([name]);
            await findModelAndThrow({
                name,
                branch_id,
                category_id: { [Op.not]: category_id },
                parent_id: { [Op.not]: category.parent_id },
            }, Category);
        }

        Validation.isTrue(!BRANCH_CATEGORIES.includes(category.name), {
            message: 'Cannot update default categories',
        });
        Validation.isTrue(!BRANCH_CATEGORIES.includes(name), {
            message: 'Cannot use default category names',
        });

        if (typeof price == 'number') {
            Validation.isTrue(price > 0);
        }

        if (file) {
            await AssetService.upsertAsset({
                asset: category.image,
                owner_id: category.category_id,
                file,
                type: 'CATEGORY_IMAGE',
            }, extras);
        }

        await category.update({
            name,
            price,
            visibility,
        }, { transaction: extras.transaction });

        return category;
    }

    /**
     * 
     * @param {{
     *  category_id:string
     *  branch_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteCategory({ category_id, branch_id }, extras) {
        /** @type {TCategory} */
        const category = await findModelOrThrow({ category_id }, Category, {
            include: [
                {
                    model: Item,
                    as: 'items',
                },
            ],
            throwOnDeleted: true,
            messageOnDeleted: "Category is already deleted",
        });
        Validation.authority(branch_id, category.branch_id);
        Validation.isTrue(!BRANCH_CATEGORIES.includes(category.name), {
            message: 'Cannot delete default categories',
        });
        Validation.isTrue(category.type != CATEGORY_TYPES.MAIN, {
            message: `${firstLetterCapital(category.type)} category cannot be deleted`,
        });

        if (category.items) {
            const uncategorizedCategory = await this.findUncategorizedCategory(branch_id);
            await Promise.all(category.items
                .map(item => item.update({ category_id: uncategorizedCategory.category_id }, extras)));
        }

        const parentCategories = await Category.findAll({
            where: {
                [Op.or]: [Sequelize.fn('JSON_CONTAINS', Sequelize.col('children'), JSON.stringify([category_id]))],
            },
        });

        await Promise.all(parentCategories.map(async parentCategory => {
            parentCategory.children = parentCategory.children.filter(child => child != category_id);
            await parentCategory.save({ transaction: extras.transaction });
        }));

        await category.destroy({ transaction: extras.transaction });
    }

    /**
     * 
     * @param {{
     * category_id:string
     * branch_id:string
     * child_id:string
     * name:string
     * price:number
     * options:TOptionCategory[]
     * }} param0 
     * @param {Extras} extras 
     */
    static async appendChildOption({ category_id, branch_id, child_id, name, price, options }, extras) {
        /** @type {TCustomCategory} */
        const category = await findModelOrThrow({
            branch_id,
            category_id,
            type: CATEGORY_TYPES.CUSTOM,
        }, Category);

        let childCategory;
        if (child_id) {
            childCategory = await findModelOrThrow({
                branch_id,
                category_id: child_id,
                type: CATEGORY_TYPES.OPTION
            }, Category);
        } else {
            Validation.emptyStringParameters([name]);
            childCategory = await this.createOptionCategory({ branch_id, name, options, price }, extras);
        }

        if (category.children) {
            Validation.isTrue(!category.children.includes(category_id));
            category.children = [...category.children, childCategory.category_id];
        } else {
            category.children = [childCategory.category_id];
        }

        await category.save({ transaction: extras.transaction });

        return category;
    }

    /**
     * 
     * @param {{
     * category_id:string
     * branch_id:string
     * child_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async removeChildOption({ category_id, branch_id, child_id }, extras) {
        /** @type {TCustomCategory} */
        const category = await findModelOrThrow({ category_id, branch_id, type: CATEGORY_TYPES.CUSTOM }, Category);
        Validation.isTrue(category.children?.includes(child_id), {
            message: 'Child option not exist in category',
        });

        category.children = category.children.filter(child => child != child_id);
        await category.save({ transaction: extras.transaction });

        return category;
    }

    /**
     * 
     * @param {string} name 
     * @param {string} branch_id 
     */
    static async findMainCategoryByName(name, branch_id) {

        const category = await findModelOrThrow({ name, type: 'MAIN', branch_id }, Category, {
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Category,
                    as: 'categories',
                    separate: true,
                    include: [
                        {
                            model: Item,
                            as: 'items',
                            include: [
                                {
                                    model: Asset,
                                    as: 'image',
                                },
                            ],
                        },
                        {
                            model: Asset,
                            as: 'image',
                        },
                    ],
                },
                {
                    model: Asset,
                    as: 'image',
                },
            ],
        });

        const findCategories = await Category.findAll({
            include: [
                {
                    model: Category,
                    as: 'options',
                },
                {
                    model: Asset,
                    as: 'image',
                },
            ],
            where: {
                branch_id,
            },
        });

        const categories = findCategories.map(c => c.toJSON());
        const categoryData = {};
        categories.forEach(category => {
            categoryData[category.category_id] = category;
        });
        categories.forEach(category => {
            setChildren(category, categoryData);
        });

        category.categories.forEach(c => {
            setChildren(c.dataValues, categoryData);
        });

        return category;
    }

    /**
     * 
     * @param {string} branch_id 
     */
    static async findAllOptions(branch_id) {
        const optionCategories = await Category.findAll({
            include: [
                {
                    model: Category,
                    as: 'options',
                },
            ],
            where: {
                branch_id,
                type: CATEGORY_TYPES.OPTION,
            }
        });

        const findCategories = await Category.findAll({
            where: {
                branch_id,
            },
        });

        const categories = findCategories.map(c => c.toJSON());
        const categoryData = {};
        categories.forEach(category => {
            categoryData[category.category_id] = category;
        });
        categories.forEach(category => {
            setChildren(category, categoryData);
        });

        optionCategories.forEach(category => {
            category.options.forEach(c => {
                setChildren(c.dataValues, categoryData);
            });
        });

        return optionCategories;
    }

    /**
     * 
     * @param {string} name 
     * @param {string} branch_id 
     */
    static async findCategoryByName(name, branch_id) {
        /** @type {TCategory} */
        const category = await findModelOrThrow({ name, branch_id }, Category, {
            include: [
                {
                    model: Asset,
                    as: 'image',
                },
            ],
        });
        return category;
    }

    /**
     * 
     * @param {string} branch_id 
     * @returns 
     */
    static async findCustomPresetCategory(branch_id) {
        /** @type {TItemCategory} */
        const category = await findModelOrThrow({ name: 'CUSTOM_PRESET', branch_id }, Category);
        return category;
    }

    /**
     * 
     * @param {string} branch_id 
     * @returns 
     */
    static async findUncategorizedCategory(branch_id) {
        /** @type {TMainCategory} */
        const category = await findModelOrThrow({ name: 'UNCATEGORIZED', branch_id }, Category);
        return category;
    }
}

module.exports = CategoryService;