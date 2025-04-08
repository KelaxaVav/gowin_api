const { State } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const StateService = require("../../services/state");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { name, is_active } = req.body;

	const states = await StateService.createState({
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(states, { message: 'State created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(State, req.query);

	const states = await State.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(states, {
		message: 'States loaded successfully',
		total: await State.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { state_id } = req.params;

	// /** @type {TTransfer} */
	const state = await findModelOrThrow({ state_id }, State);


	return res.sendRes(state, { message: 'State loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { state_id } = req.params;
	const { name, is_active } = req.body;

	const state = await StateService.updateStates({
		state_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(state, { message: 'State updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { state_id } = req.params;

	await StateService.deleteState({ state_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'State deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};