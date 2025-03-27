const { Team } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const TeamService = require("../../services/team");

const create = routeHandler(async (req, res, extras) => {
	const { name, is_active } = req.body;

	const teams = await TeamService.createType({
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(teams, { message: 'Team created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const teams = await Team.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']]
	});

	return res.sendRes(teams, {
		message: 'Teams loaded successfully',
		total: await Team.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { team_id } = req.params;

	// /** @type {TTransfer} */
	const team = await findModelOrThrow({ team_id }, Team);


	return res.sendRes(team, { message: 'Team loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { team_id } = req.params;
	const { name, is_active } = req.body;

	const team = await TeamService.updateTypes({
		team_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(team, { message: 'Team updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { team_id } = req.params;

	await TeamService.deleteType({ team_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Team deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};