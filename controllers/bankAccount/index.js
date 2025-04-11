const { Bank, BankAccountType, BankAccount } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const BankAccountService = require("../../services/bankAccount");

const create = routeHandler(async (req, res, extras) => {
	const { acc_name, account_no, pan_no, ifsc_code, gst_no, aadhar_no, others, mobile,mail,tan_no,user_type,bank_id, bank_account_type_id, is_active } = req.body;

	
	const bankAccounts = await BankAccountService.createBankAccount({
		acc_name,
		account_no,
		pan_no,
		ifsc_code,
		gst_no,
		aadhar_no,
		mobile,
		mail,
		tan_no,
		others,
		user_type,
		bank_id,
		bank_account_type_id,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(bankAccounts, { message: 'Bank Account created successfully', status: STATUS_CODE.OK });
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
		message: 'Bank Accounts loaded successfully',
		total: await Bank.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { bank_account_id } = req.params;

	// /** @type {TTransfer} */
	const account = await findModelOrThrow({ bank_account_id }, BankAccount,{include: [
		{
			model: Bank,
			as: "bank"
		},
		{
			model: BankAccountType,
			as: 'bankAccountType'
		}

	]});


	return res.sendRes(account, { message: 'Bank Account loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { bank_account_id } = req.params;
	const { acc_name, account_no, pan_no, ifsc_code, gst_no, aadhar_no, mobile, mail, tan_no, others, user_type, bank_id, bank_account_type_id, is_active } = req.body;

	const account = await BankAccountService.updateBankAccounts({
		bank_account_id,
		acc_name,
		account_no,
		pan_no,
		ifsc_code,
		gst_no,
		aadhar_no,
		mobile,
		mail,
		tan_no,
		others,
		user_type,
		bank_id,
		bank_account_type_id,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(account, { message: 'Bank Account updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { bank_account_id } = req.params;

	await BankAccountService.deleteBankAccount({ bank_account_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Bank Account deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};