const { Category, Item, Branch, Asset } = require("../../models");
const { STATUS_CODE, arrayOrNotToArray } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow, Validation } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const CategoryService = require("../../services/category");
const { Op } = require("sequelize");

const create = routeHandler(async (req, res, extras) => {
	const { name, parent_id, price, type, visibility, options } = req.body;
	const { branch_id } = req.branch;

	const category = await CategoryService.createCategory({
		name,
		branch_id,
		parent_id,
		options,
		price,
		type,
		visibility,
		file: req.file,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(category, { message: 'Category created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Category, req.query, {
		defaultFilterObject: { branch_id },
		defaultMainOpAnd: [
			{
				name: {
					[Op.not]: 'CUSTOM_PRESET',
				}
			}
		],
	});

	const categories = await Category.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Asset,
				as: 'image',
			}
		],
		where: whereOption,
	});

	const uncategorizedCategory = await CategoryService.findCategoryByName('UNCATEGORIZED', branch_id);
	categories.push(uncategorizedCategory);

	return res.sendRes(categories, {
		message: 'Categories loaded successfully',
		total: await Category.count(),
	});
}, false);

// for dev
const getAllMainCategories = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Category, req.query, { defaultFilterObject: { branch_id, 'type': 'MAIN' } });

	const categories = await Category.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Asset,
				as: 'image',
			},
		],
		where: whereOption,
	});

	return res.sendRes(categories, {
		message: 'Main categories loaded successfully',
		total: await Category.count(),
	});
}, false);

const getAllOptions = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;

	const posMenu = await CategoryService.findCategoryByName('POS_MENU', branch_id);
	const categories = await CategoryService.findAllOptions(branch_id);

	return res.sendRes(categories, { message: 'Option categories loaded successfully', pos_menu_category_id: posMenu.category_id });
}, false);

const getMainCategoryByName = routeHandler(async (req, res, extras) => {
	const { name } = req.params;
	const { branch_id } = req.branch;

	const category = await CategoryService.findMainCategoryByName(name, branch_id);

	return res.sendRes(category, {
		message: 'Main category loaded successfully',
		total: await Category.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { category_id } = req.params;

	const category = await findModelOrThrow({ category_id }, Category, {
		include: [
			{
				model: Branch,
				as: 'branch',
			},
			{
				model: Category,
				as: 'category',
			},
			{
				model: Category,
				as: 'options',
			},
			{
				model: Item,
				as: 'items',
			},
			{
				model: Category,
				as: 'categories',
			},
			{
				model: Asset,
				as: 'image',
			},
		],
	});

	return res.sendRes(category, { message: 'Category loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { category_id } = req.params;
	const { branch_id } = req.branch;
	const { parent_id, name, price, visibility } = req.body;

	const category = await CategoryService.updateCategory({
		category_id,
		branch_id,
		parent_id,
		name,
		price,
		visibility,
		file: req.file,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(category, { message: 'Category updated successfully', status: STATUS_CODE.OK });
});

const appendChildOption = routeHandler(async (req, res, extras) => {
	const { category_id } = req.params;
	const { branch_id } = req.branch;
	const { child_id, name, price, options } = req.body;

	const category = await CategoryService.appendChildOption({
		category_id,
		branch_id,
		child_id,
		name,
		price,
		options,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(category, { message: 'Category option appended successfully', status: STATUS_CODE.OK });
});

const removeChildOption = routeHandler(async (req, res, extras) => {
	const { category_id } = req.params;
	const { branch_id } = req.branch;
	const { child_id } = req.body;

	const category = await CategoryService.removeChildOption({
		category_id,
		branch_id,
		child_id
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(category, { message: 'Category option removed successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { category_id } = req.params;
	const { branch_id } = req.branch;

	await CategoryService.deleteCategory({ category_id, branch_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Category deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getAllOptions,
	getAllMainCategories,
	getMainCategoryByName,
	getById,
	updateById,
	appendChildOption,
	removeChildOption,
	deleteById,
};