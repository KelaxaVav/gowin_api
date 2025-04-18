const { Designation } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const DesignationService = require("../../services/designation");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { name, is_active } = req.body;

	const designations = await DesignationService.createDesignation({
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(designations, { message: 'Designation created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Designation, req.query);

	const designations = await Designation.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(designations, {
		message: 'Designations loaded successfully',
		total: await Designation.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { designation_id } = req.params;

	// /** @type {TTransfer} */
	const designation = await findModelOrThrow({ designation_id }, Designation);


	return res.sendRes(designation, { message: 'Designation loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { designation_id } = req.params;
	const { name, is_active } = req.body;

	const state = await DesignationService.updateDesignation({
		designation_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(state, { message: 'Designation updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { designation_id } = req.params;

	await DesignationService.deleteDesignation({ designation_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Designation deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};