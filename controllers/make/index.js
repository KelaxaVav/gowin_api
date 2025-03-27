const {  Make } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const MakeService = require("../../services/make");

const create = routeHandler(async (req, res, extras) => {
	const { name, is_active } = req.body;

	const makes = await MakeService.createMake({
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(makes, { message: 'Make created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const makes = await Make.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']]
	});

	return res.sendRes(makes, {
		message: 'Makes loaded successfully',
		total: await Make.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { make_id } = req.params;

	// /** @type {TTransfer} */
	const state = await findModelOrThrow({ make_id }, Make);


	return res.sendRes(state, { message: 'Make loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { make_id } = req.params;
	const { name, is_active } = req.body;

	const state = await MakeService.updateMakes({
		make_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(state, { message: 'Make updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { make_id } = req.params;

	await MakeService.deleteMake({ make_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Make deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};