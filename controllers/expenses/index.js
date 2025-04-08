const { Expenses, ExpensesCategory } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const ExpensesService = require("../../services/expenses");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { name, expenses_category_id, is_active } = req.body;

	const expenses = await ExpensesService.createType({
		name,
		expenses_category_id,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(expenses, { message: 'Expense created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Expenses, req.query);

	const expenses = await Expenses.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: ExpensesCategory,
				as: 'expenses_category',
			}
		],
		where: whereOption,
	});

	return res.sendRes(expenses, {
		message: 'Expenses loaded successfully',
		total: await Expenses.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { expenses_id } = req.params;

	// /** @type {TTransfer} */
	const expense = await findModelOrThrow({ expenses_id }, Expenses, {
		include: [
			{
				model: ExpensesCategory,
				as: 'expenses_category',
			}
		]
	});


	return res.sendRes(expense, { message: 'Expenses loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { expenses_id } = req.params;
	const { name, expenses_category_id, is_active } = req.body;

	const expense = await ExpensesService.updateTypes({
		expenses_id,
		expenses_category_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(expense, { message: 'Expenses updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { expenses_id } = req.params;

	await ExpensesService.deleteType({ expenses_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Expenses deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};