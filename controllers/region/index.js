const { Region } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const RegionService = require("../../services/region");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { name, is_active } = req.body;

	const regions = await RegionService.createType({
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(regions, { message: 'Region created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Region, req.query);

	const regions = await Region.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(regions, {
		message: 'Regions loaded successfully',
		total: await Region.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { region_id } = req.params;

	// /** @type {TTransfer} */
	const region = await findModelOrThrow({ region_id }, Region);


	return res.sendRes(region, { message: 'Region loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { region_id } = req.params;
	const { name, is_active } = req.body;

	const region = await RegionService.updateTypes({
		region_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(region, { message: 'Region updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { region_id } = req.params;

	await RegionService.deleteType({ region_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Region deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};