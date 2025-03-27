const {  Insurer } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const InsurerService = require("../../services/insurer");

const create = routeHandler(async (req, res, extras) => {
	const { name, is_active } = req.body;

	const states = await InsurerService.createInsurer({
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(states, { message: 'Insurer created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const states = await Insurer.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']]
	});

	return res.sendRes(states, {
		message: 'Insurers loaded successfully',
		total: await Insurer.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { insurer_id } = req.params;

	// /** @type {TTransfer} */
	const state = await findModelOrThrow({ insurer_id }, Insurer);


	return res.sendRes(state, { message: 'Insurer loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { insurer_id } = req.params;
	const { name, is_active } = req.body;

	const state = await InsurerService.updateInsurers({
		insurer_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(state, { message: 'Insurer updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { insurer_id } = req.params;

	await InsurerService.deleteInsurer({ insurer_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Insurer deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};