const { Item, Batch, Category, InvoiceItem, Asset } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow, Validation } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const ItemService = require("../../services/item");
const { ITEM_TYPES } = require("../../data/constants");
const { Op } = require("sequelize");

const create = routeHandler(async (req, res, extras) => {
	const { name, unit, threshold, is_deliverable, category_id, quantity, price, price_min } = req.body;
	const { branch_id } = req.branch;
	const { file } = req;

	const item = await ItemService.createItem({
		name,
		unit,
		threshold,
		is_deliverable,
		branch_id,
		category_id,
		quantity,
		price,
		price_min,
		file,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(item, { message: 'Item created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Item, req.query, {
		defaultFilterObject: {
			type: ITEM_TYPES.GENERIC,
		},
	});

	const items = await Item.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Category,
				as: 'category',
				where: {
					branch_id,
				},
			},
			{
				model: Batch,
				as: 'batches',
			},
			{
				model: Asset,
				as: 'image',
			},
		],
		where: whereOption,
	});

	return res.sendRes(items, {
		message: 'Items loaded successfully',
		total: await Item.count(),
	});
}, false);

const getAllItemsForInvoice = routeHandler(async (req, res, extras) => {
	const branch_id = req.query.branch_id ?? req.branch.branch_id;

	const whereOption = whereSearchAndFilter(Item, req.query, {
		defaultFilterObject: {
			type: ITEM_TYPES.GENERIC,
		},
	});

	const items = await Item.findAll({
		...req.paginate,
		order: [
			['id', 'ASC'],
			['batches', 'id', 'ASC'],
		],
		include: [
			{
				model: Category,
				as: 'category',
				where: {
					branch_id,
				},
			},
			{
				model: Batch,
				as: 'batches',
				required: false,
				where: {
					quantity: {
						[Op.gt]: 0,
					},
				}
			},
			{
				model: Asset,
				as: 'image',
			},
		],
		where: whereOption,
	});

	items.forEach(item => item.dataValues.branch_id = branch_id);

	return res.sendRes(items, {
		message: 'Items loaded successfully',
		total: await Item.count(),
	});
}, false);

const getAllCustomItems = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Item, req.query);

	const items = await Item.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Category,
				as: 'category',
				where: {
					branch_id,
					name: 'CUSTOM_PRESET',
				},
			},
			{
				model: Batch,
				as: 'batches',
			},
			{
				model: Asset,
				as: 'image',
			},
		],
		where: whereOption,
	});

	return res.sendRes(items, {
		message: 'Custom Items loaded successfully',
		total: await Item.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { item_id } = req.params;

	const item = await findModelOrThrow({ item_id }, Item, {
		include: [
			{
				model: Category,
				as: 'category',
			},
			{
				model: Batch,
				as: 'batches',
				include: [
					{
						model: InvoiceItem,
						as: 'invoiceItems',
					}
				],
			},
			{
				model: Asset,
				as: 'image',
			},
		],
	});

	item.batches.forEach(batch => {
		batch.dataValues.is_used = !!batch.invoiceItems.length;
		delete batch.dataValues.invoiceItems;
	});

	return res.sendRes(item, { message: 'Item loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { item_id } = req.params;
	const { name, threshold, unit, is_deliverable, category_id } = req.body;
	const { branch_id } = req.branch;
	const { file } = req;

	const item = await ItemService.updateItem({
		item_id,
		name,
		unit,
		threshold,
		is_deliverable,
		branch_id,
		category_id,
		file,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(item, { message: 'Item updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { item_id } = req.params;
	const { branch_id } = req.branch;

	await ItemService.deleteItem({ item_id, branch_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Item deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getAllItemsForInvoice,
	getAllCustomItems,
	getById,
	updateById,
	deleteById,
};