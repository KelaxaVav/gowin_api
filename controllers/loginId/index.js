const { LoginId, Insurer } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const LoginIdService = require("../../services/loginId");

const create = routeHandler(async (req, res, extras) => {
	const { insurer_id, loginId, is_active } = req.body;

	const loginIds = await LoginIdService.createLoginId({
		insurer_id,
		loginId,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(loginIds, { message: 'LOGIN ID created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const loginIds = await LoginId.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Insurer,
				as: 'insurer',
			},
		],
	});

	return res.sendRes(loginIds, {
		message: 'LOGIN ID loaded successfully',
		total: await LoginId.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { loginId_id } = req.params;

	// /** @type {TTransfer} */
	const loginIds = await findModelOrThrow({ loginId_id }, LoginId);


	return res.sendRes(loginIds, { message: 'LOGIN ID loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { loginId_id } = req.params;
	const { insurer_id, loginId, is_active } = req.body;

	const loginIds = await LoginIdService.updateLoginId({
		loginId_id,
		insurer_id,
		loginId,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(loginIds, { message: 'LOGIN ID updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { loginId_id } = req.params;

	await LoginIdService.deleteLoginId({ loginId_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'LOGIN ID deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};