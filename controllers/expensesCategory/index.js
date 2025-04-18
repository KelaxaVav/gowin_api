const { ExpensesCategory } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const ExpensesCategoryService = require("../../services/expensesCategory");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { name, is_active } = req.body;

	const expenses = await ExpensesCategoryService.createType({
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(expenses, { message: 'Expenses Category created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(ExpensesCategory, req.query);

	const expenses = await ExpensesCategory.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(expenses, {
		message: 'Expenses Category Category loaded successfully',
		total: await ExpensesCategory.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { expenses_category_id } = req.params;

	// /** @type {TTransfer} */
	const expense = await findModelOrThrow({ expenses_category_id }, ExpensesCategory);


	return res.sendRes(expense, { message: 'Expenses Category loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { expenses_category_id } = req.params;
	const { name, is_active } = req.body;

	const expense = await ExpensesCategoryService.updateTypes({
		expenses_category_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(expense, { message: 'Expenses Category updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { expenses_category_id } = req.params;

	await ExpensesCategoryService.deleteType({ expenses_category_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Expenses Category deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};