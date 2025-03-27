const { Transaction, Invoice, Expense, Salary, Branch, } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const TransactionService = require("../../services/transaction");
const { TRANSACTION_REASONS, TRANSACTION_ENTITY_TYPES } = require("../../data/constants");

const payInvoice = routeHandler(async (req, res, extras) => {
	const { invoice_id } = req.params;
	const { branch_id } = req.branch;
	const { date, amount, reason } = req.body;

	const transaction = await TransactionService.createTransaction({
		entity_id: invoice_id,
		entity_type: TRANSACTION_ENTITY_TYPES.INVOICE,
		branch_id,
		date,
		amount,
		reason,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(transaction, { message: 'Invoice payment added successfully', status: STATUS_CODE.OK });
});

const payExpense = routeHandler(async (req, res, extras) => {
	const { expense_id } = req.params;
	const { branch_id } = req.branch;
	const { date, amount } = req.body;

	const transaction = await TransactionService.createTransaction({
		entity_id: expense_id,
		entity_type: TRANSACTION_ENTITY_TYPES.EXPENSE,
		branch_id,
		date,
		amount,
		reason: TRANSACTION_REASONS.EXPENSE,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(transaction, { message: 'Expense payment added successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Transaction, req.query, { defaultFilterObject: { branch_id } });

	const transactions = await Transaction.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Branch,
				as: 'branch',
				paranoid: false,
			},
			{
				model: Invoice,
				as: 'invoice',
				paranoid: false,
			},
			{
				model: Salary,
				as: 'salary',
				paranoid: false,
			},
			{
				model: Expense,
				as: 'expense',
				paranoid: false,
			},
		],
		where: whereOption,
	});

	return res.sendRes(transactions, {
		message: 'Transactions loaded successfully',
		total: await Transaction.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { transaction_id } = req.params;

	const transaction = await findModelOrThrow({ transaction_id }, Transaction, {
		include: [
			{
				model: Invoice,
				as: 'invoice',
				paranoid: false,
			},
			{
				model: Salary,
				as: 'salary',
				paranoid: false,
			},
			{
				model: Expense,
				as: 'expense',
				paranoid: false,
			},
		],
	});

	return res.sendRes(transaction, { message: 'Transaction loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { transaction_id } = req.params;
	const { branch_id } = req.branch;
	const { amount, date, reason, status } = req.body;

	const transaction = await TransactionService.updateTransaction({
		transaction_id,
		branch_id,
		amount,
		date,
		reason,
		status,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(transaction, { message: 'Transaction updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { transaction_id } = req.params;
	const { branch_id } = req.branch;

	await TransactionService.deleteTransaction({ transaction_id, branch_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Transaction deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	payInvoice,
	payExpense,
	getAll,
	getById,
	updateById,
	deleteById,
};