const { KitchenOrder, KitchenOrderItem, InvoiceItem, Batch, Item, Category, Invoice, Customer } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { Validation, findModelAndThrow, findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const { Op } = require("sequelize");
const KitchenService = require("../../services/kitchen");
const { KITCHEN_ORDER_STATUSES, KITCHEN_ORDER_TYPES } = require("../../data/constants");

const create = routeHandler(async (req, res, extras) => {
	const { kitchenOrderItems } = req.body;
	const { branch_id } = req.branch;

	const kitchenOrders = await KitchenService.createKitchenOrders({
		branch_id,
		type: 'STOCK',
	}, kitchenOrderItems, extras);

	await extras.transaction.commit();
	return res.sendRes(kitchenOrders, { message: 'Kitchen order created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(KitchenOrder, req.query, {
		defaultMainOpAnd: [
			{
				[Op.or]: [
					{ '$invoiceItem.batch.item.category.branch_id$': branch_id },
					{ '$kitchenOrderItem.item.category.branch_id$': branch_id },
				],
			},
		],
	});

	/** @type {TKitchenOrder[]} */
	const kitchenOrders = await KitchenOrder.findAll({
		include: [
			{
				model: KitchenOrderItem,
				as: 'kitchenOrderItem',
				include: [
					{
						model: Item,
						as: 'item',
						include: [
							{
								model: Category,
								attributes: [],
								as: 'category',
							}
						],
					}
				],
			},
			{
				model: InvoiceItem,
				as: 'invoiceItem',
				include: [
					{
						model: Batch,
						as: 'batch',
						include: [
							{
								model: Item,
								as: 'item',
								include: [
									{
										model: Category,
										as: 'category',
										attributes: [],
									}
								],
							}
						],
					},
					{
						model: Invoice,
						as: 'invoice',
						include: [
							{
								model: Customer,
								as: 'customer',
							}
						],
					}
				],
			},
		],
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(kitchenOrders, {
		message: 'Kitchen orders loaded successfully',
		total: await KitchenOrder.count(),
	});
}, false);

const getAllAsStatusCategorized = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(KitchenOrder, req.query, {
		defaultMainOpAnd: [
			{
				[Op.or]: [
					{ '$invoiceItem.batch.item.category.branch_id$': branch_id },
					{ '$kitchenOrderItem.item.category.branch_id$': branch_id },
				],
			},
		],
	});

	/** @type {TKitchenOrder[]} */
	const kitchenOrders = await KitchenOrder.findAll({
		include: [
			{
				model: KitchenOrderItem,
				as: 'kitchenOrderItem',
				include: [
					{
						model: Item,
						as: 'item',
						include: [
							{
								model: Category,
								attributes: [],
								as: 'category',
							}
						],
					}
				],
			},
			{
				model: InvoiceItem,
				as: 'invoiceItem',
				include: [
					{
						model: Batch,
						as: 'batch',
						include: [
							{
								model: Item,
								as: 'item',
								include: [
									{
										model: Category,
										as: 'category',
										attributes: [],
									}
								],
							}
						],
					}
				],
			},
		],
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	const categoryData = {};
	kitchenOrders.forEach(kO => {
		if (kO.type == KITCHEN_ORDER_TYPES.INVOICE) {
			Object.keys(kO.invoiceItem.batch.item.customItem).forEach(key => {
				const customField = kO.invoiceItem.batch.item.customItem[key];

				categoryData[key] = null;
				categoryData[customField.value] = null;
			});
		}
	});

	const findCategories = await Category.findAll({
		where: {
			category_id: {
				[Op.or]: Object.keys(categoryData)
			},
		},
	});

	findCategories.forEach(fC => categoryData[fC.category_id] = fC);

	kitchenOrders.forEach(kO => {
		const customData = [];
		if (kO.type == KITCHEN_ORDER_TYPES.INVOICE) {
			Object.keys(kO.invoiceItem.batch.item.customItem).forEach(key => {
				const customLabel = categoryData[key].name;
				const customField = kO.invoiceItem.batch.item.customItem[key];
				const customValue = categoryData[customField.value].name;

				customData.push({
					label: customLabel,
					value: customValue,
				});
			});

		}

		kO.dataValues.customData = customData;
	});

	/** @type {{[key:string]:TKitchenOrder[]}} */
	const data = {};
	Object.keys(KITCHEN_ORDER_STATUSES).forEach(key => {
		data[key] = [];
	});

	kitchenOrders.forEach(kO => data[kO.status].push(kO));

	return res.sendRes(data, { message: 'Kitchen orders loaded successfully' });
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { kitchen_order_id } = req.params;

	const kitchenOrder = await findModelOrThrow({ kitchen_order_id }, KitchenOrder, {
		include: [
			{
				model: KitchenOrderItem,
				as: 'kitchenOrderItem'
			},
			{
				model: InvoiceItem,
				as: 'invoiceItem'
			},
		],
	});

	return res.sendRes(kitchenOrder, { message: 'Kitchen order loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { kitchen_order_id } = req.params;
	const { branch_id } = req.branch;

	const {
		item_id,
		price,
		quantity,
		delivery_at,
	} = req.body;

	const kitchenOrder = await KitchenService.updateStockOrder({
		kitchen_order_id,
		branch_id,
		item_id,
		price,
		quantity,
		delivery_at,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(kitchenOrder, { message: 'Kitchen order updated successfully', status: STATUS_CODE.OK });
});

const updateStatus = routeHandler(async (req, res, extras) => {
	const { kitchen_order_id, status } = req.params;
	const { branch_id } = req.branch;

	const kitchenOrder = await KitchenService.updateOrderStatus({ kitchen_order_id, branch_id, status }, extras);

	await extras.transaction.commit();
	return res.sendRes(kitchenOrder, { message: 'Kitchen order status updated successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getAllAsStatusCategorized,
	getById,
	updateById,
	updateStatus,
};