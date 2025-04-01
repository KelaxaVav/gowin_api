const { Team, Staff, Partner, Branch } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const TeamService = require("../../services/team");
const { ROLES } = require("../../data/constants");

const create = routeHandler(async (req, res, extras) => {
	const { name, branch_id, is_active } = req.body;

	const teams = await TeamService.createTeam({
		name,
		branch_id,
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

	/** @type {TTeam} */
	const team = await findModelOrThrow({ team_id }, Team, {
		include: [
			{
				model: Branch,
				as: 'branch',
			},
			{
				model: Staff,
				as: 'branchManager',
			},
			{
				model: Staff,
				as: 'relationshipManagers',
				include: [
					{
						model: Partner,
						as: 'partners',
					},
				]
			},
		],
	});

	return res.sendRes(team, { message: 'Team loaded successfully', status: STATUS_CODE.OK });
}, false);

const test = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.query;

	const branch = await findModelOrThrow({ branch_id }, Branch, {
		include: [
			{
				model: Team,
				as: 'teams',
				include: [
					{
						model: Staff,
						as: 'branchManager',
						include: [
							{
								model: Staff,
								as: 'relationshipManagers',
								include: [
									{
										model: Partner,
										as: 'partners',
									},
								]
							},
						]
					},
				],
			}
		]
	});

	return res.sendRes(branch, { message: 'Branch loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { team_id } = req.params;
	const { name, is_active, staff_id } = req.body;

	const team = await TeamService.updateTeam({
		team_id,
		staff_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(team, { message: 'Team updated successfully', status: STATUS_CODE.OK });
});

const updatePartners = routeHandler(async (req, res, extras) => {
	const { team_id } = req.params;
	const { relationship_manager_id, partners } = req.body;

	const team = await TeamService.updatePartners({
		team_id,
		relationship_manager_id,
		partners,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(team, { message: 'Partners updated successfully', status: STATUS_CODE.OK });
});

const updateManagers = routeHandler(async (req, res, extras) => {
	const { team_id } = req.params;
	const { managers } = req.body;

	const team = await TeamService.updateRelationshipManagers({
		team_id,
		managers,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(team, { message: `Team relationship managers updated successfully`, status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { team_id } = req.params;

	await TeamService.deleteTeam({ team_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Team deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	test,
	create,
	getAll,
	getById,
	updateById,
	updateManagers,
	updatePartners,
	deleteById
};