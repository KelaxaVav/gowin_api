const { City, State } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const CityService = require("../../services/city");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { name, state_id, is_active } = req.body;

	const cities = await CityService.createCity({
		name,
		state_id,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(cities, { message: 'City created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(City, req.query);

	const cities = await City.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: State,
				as: 'state'
			}
		],
		where: whereOption,
	});

	return res.sendRes(cities, {
		message: 'Citys loaded successfully',
		total: await City.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { city_id } = req.params;

	// /** @type {TTransfer} */
	const team = await findModelOrThrow({ city_id }, City,
		{
			include: [{
				model: State,
				as: 'state'
			}
			]
		}
	);


	return res.sendRes(team, { message: 'City loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { city_id } = req.params;
	const { name, is_active } = req.body;

	const team = await CityService.updateCities({
		city_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(team, { message: 'City updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { city_id } = req.params;

	await CityService.deleteCity({ city_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'City deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};