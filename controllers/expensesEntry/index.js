const { Expenses, ExpensesCategory, ExpensesEntry } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const ExpensesEntryService = require("../../services/expensesEntry");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { entry_date, expenses_id, expenses_category_id, amount, taxes, is_active } = req.body;

	const expenses = await ExpensesEntryService.createExpensesEntry({
		entry_date: new Date(entry_date),
		expenses_id,
		expenses_category_id,
		amount,
		taxes,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(expenses, { message: 'Expenses Entry created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(ExpensesEntry, req.query);

	const expenses = await ExpensesEntry.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Expenses,
				as: 'expenses',
			},
			{
				model: ExpensesCategory,
				as: 'expenses_category',
			}
		],
		where: whereOption,
	});

	expenses.map((expense) => {
		expense.dataValues.total_amount = expense.dataValues.amount + ((expense.dataValues.amount * expense.dataValues.taxes) / 100);
	});

	return res.sendRes(expenses, {
		message: 'Expenses loaded successfully',
		total: await ExpensesEntry.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { expenses_entry_id } = req.params;

	// /** @type {TTransfer} */
	const expense = await findModelOrThrow({ expenses_entry_id }, ExpensesEntry, {
		include: [
			{
				model: Expenses,
				as: 'expenses',
			},
			{
				model: ExpensesCategory,
				as: 'expenses_category',
			}
		]
	});


	return res.sendRes(expense, { message: 'Expenses loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { expenses_entry_id } = req.params;
	const { entry_date, expenses_id, expenses_category_id, amount, taxes, is_active } = req.body;

	const expense = await ExpensesEntryService.updateExpensesEntry({
		expenses_entry_id,
		entry_date: new Date(entry_date),
		expenses_id,
		expenses_category_id,
		amount,
		taxes,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(expense, { message: 'Expenses updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { expenses_entry_id } = req.params;

	await ExpensesEntryService.deleteExpensesEntry({ expenses_entry_id }, extras);

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