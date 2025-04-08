const { Bank } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const BankService = require("../../services/bank");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { bankNames, is_active } = req.body;
	let designations = [];
	bankNames.forEach(async (bank) => {
		designations.push(
			{
				name: bank.name,
				is_active: is_active
			}
		);
	});
	const designation = await Bank.bulkCreate(designations, { transaction: extras.transaction });
	await extras.transaction.commit();
	return res.sendRes(designation, { message: 'Bank created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Bank, req.query);

	const banks = await Bank.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(banks, {
		message: 'Banks loaded successfully',
		total: await Bank.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { bank_id } = req.params;

	// /** @type {TTransfer} */
	const designation = await findModelOrThrow({ bank_id }, Bank);


	return res.sendRes(designation, { message: 'Bank loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { bank_id } = req.params;
	const { name, is_active } = req.body;

	const state = await BankService.updateBanks({
		bank_id,
		name: req.body.bankNames[0].name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(state, { message: 'Bank updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { bank_id } = req.params;

	await BankService.deleteBank({ bank_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Bank deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};