const { State, RTO, RTOCategory } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const StateService = require("../../services/state");
const RTOService = require("../../services/rto");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { state_id, rto_category_id, name, is_active } = req.body;

	const rtos = await RTOService.createRTO({
		state_id,
		rto_category_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(rtos, { message: 'RTO created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(RTO, req.query);

	const rtos = await RTO.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: State,
				as: 'state',
			},
			{
				model: RTOCategory,
				as: 'rto_category',
			}
		],
		where: whereOption,
	});

	return res.sendRes(rtos, {
		message: 'RTO loaded successfully',
		total: await RTO.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { rto_id } = req.params;

	// /** @type {TTransfer} */
	const rto = await findModelOrThrow({ rto_id }, RTO);


	return res.sendRes(rto, { message: 'RTO loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { rto_id } = req.params;
	const { state_id, rto_category_id, name, is_active } = req.body;

	const rto = await RTOService.updateRTOs({
		rto_id,
		rto_category_id,
		state_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(rto, { message: 'RTO updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { rto_id } = req.params;

	await RTOService.deleteRTO({ rto_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'RTO deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};