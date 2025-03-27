const { Bank, BankAccountType, BankAccount } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const BankAccountService = require("../../services/bankAccount");

const create = routeHandler(async (req, res, extras) => {
	const { name, account_no, pan_no, ifsc_code, gst_no, aadhar_no, other_names, bank_id, bank_account_type_id, is_active } = req.body;

	
	const bankAccounts = await BankAccountService.createBankAccount({
		name,
		account_no,
		pan_no,
		ifsc_code,
		gst_no,
		aadhar_no,
		other_names,
		bank_id,
		bank_account_type_id,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(bankAccounts, { message: 'Bank created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const bankAccounts = await BankAccount.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Bank,
				as: "bank"
			},
			{
				model: BankAccountType,
				as: 'bankAccountType'
			}

		]

	});

	return res.sendRes(bankAccounts, {
		message: 'Banks loaded successfully',
		total: await Bank.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { account_id } = req.params;

	// /** @type {TTransfer} */
	const designation = await findModelOrThrow({ account_no }, Bank);


	return res.sendRes(designation, { message: 'Bank loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { bank_id } = req.params;
	const { name, is_active } = req.body;

	const state = await BankAccountService.updateBankAccounts({
		bank_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(state, { message: 'Bank updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { bank_id } = req.params;

	await BankAccountService.deleteBankAccount({ bank_id }, extras);

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