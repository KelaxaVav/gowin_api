const { Customer } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const CustomerService = require("../../services/customer");

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Customer, req.query, { defaultFilterObject: { branch_id } });

	const customers = await Customer.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(customers, {
		message: 'Customers loaded successfully',
		total: await Customer.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { customer_id } = req.params;

	const customer = await findModelOrThrow({ customer_id }, Customer);

	return res.sendRes(customer, { message: 'Customer loaded successfully', status: STATUS_CODE.OK });
}, false);

module.exports = {
	getAll,
	getById,
};