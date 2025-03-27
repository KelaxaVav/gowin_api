const { Salary, User, Role, Transaction, Position } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const SalaryService = require("../../services/salary");

const create = routeHandler(async (req, res, extras) => {
	const { month, date, salaries } = req.body;
	const { branch_id } = req.branch;

	const newSalaries = await SalaryService.addBulkSalary({
		branch_id,
		month,
		date,
		salaries,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(newSalaries, { message: 'Salaries created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Salary, req.query, {
		defaultFilterObject: {
			'$user.role.branch_id$': branch_id,
		},
	});

	const salaries = await Salary.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: User,
				as: 'user',
				include: [
					{
						model: Role,
						as: 'role',
						attributes: [],
					},
					{
						model: Position,
						as: 'position',
					},
				],
			},
			{
				model: Transaction,
				as: 'transaction',
			},
		],
		where: whereOption,
	});

	return res.sendRes(salaries, {
		message: 'Salaries loaded successfully',
		total: await Salary.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { salary_id } = req.params;

	const salary = await findModelOrThrow({ salary_id }, Salary, {
		include: [
			{
				model: User,
				as: 'user',
			},
			{
				model: Transaction,
				as: 'transaction',
			},
		],
	});

	return res.sendRes(salary, { message: 'Salary loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { salary_id } = req.params;
	const { branch_id } = req.branch;
	const { user_id, date, month, amount, note, data } = req.body;

	const salary = await SalaryService.updateSalary({
		salary_id,
		branch_id,
		user_id,
		date,
		month,
		amount,
		note,
		data,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(salary, { message: 'Salary updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { salary_id } = req.params;
	const { branch_id } = req.branch;

	await SalaryService.deleteSalary({ salary_id, branch_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Salary deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById,
};