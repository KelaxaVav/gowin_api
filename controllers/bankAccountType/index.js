const { BankAccountType, Bank } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const BankAccountTypeService = require("../../services/bankAccountType");

const create = routeHandler(async (req, res, extras) => {
	const { accountType, is_active } = req.body;

	let types = [];
	accountType.forEach(async (type) => {
		types.push(
			{
				name: type.name,
				is_active: is_active
			}
		);
	});
	const accountTypes = await BankAccountType.bulkCreate(types, { transaction: extras.transaction });

	await extras.transaction.commit();
	return res.sendRes(accountTypes, { message: 'Bank Account Type created successfully', status: STATUS_CODE.OK });
});
  
const getAll = routeHandler(async (req, res, extras) => {
	const accountTypes = await BankAccountType.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
	});

	return res.sendRes(accountTypes, {
		message: 'Bank Account Types loaded successfully',
		total: await BankAccountType.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { bank_account_type_id } = req.params;

	// /** @type {TTransfer} */
	const accountType = await findModelOrThrow({ bank_account_type_id }, BankAccountType);


	return res.sendRes(accountType, { message: 'Bank Account Type loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { bank_account_type_id } = req.params;
	const { name, is_active } = req.body;

	const state = await BankAccountTypeService.updateBankAccountTypes({
		bank_account_type_id,
		name: req.body.accountType[0].name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(state, { message: 'Bank Account Type updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { bank_account_type_id } = req.params;

	await BankAccountTypeService.deleteBankAccountType({ bank_account_type_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Bank Account Type deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};