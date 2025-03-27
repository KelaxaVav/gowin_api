const { Position } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { Validation, findModelAndThrow, findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const { Op } = require("sequelize");

const create = routeHandler(async (req, res, extras) => {
	const { name } = req.body;
	const { branch_id } = req.branch;

	Validation.nullParameters([name]);

	await findModelAndThrow({ name, branch_id }, Position);

	const position = await Position.create({ name, branch_id }, { transaction: extras.transaction });
	await extras.transaction.commit();
	return res.sendRes(position, { message: 'Position created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Position, req.query, { defaultFilterObject: { branch_id } });

	const positions = await Position.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(positions, {
		message: 'Positions loaded successfully',
		total: await Position.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { position_id } = req.params;

	const position = await findModelOrThrow({ position_id }, Position);

	return res.sendRes(position, { message: 'Position loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { position_id } = req.params;
	const { branch_id } = req.branch;

	const { name } = req.body;
	Validation.nullParameters([name]);

	const position = await findModelOrThrow({ position_id }, Position);
	Validation.authority(branch_id, position.branch_id);

	await findModelAndThrow({
		name,
		position_id: {
			[Op.not]: position_id,
		},
		branch_id,
	}, Position);

	await position.update({ name }, { transaction: extras.transaction });

	await extras.transaction.commit();
	return res.sendRes(position, { message: 'Position updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { position_id } = req.params;
	const { branch_id } = req.branch;

	const position = await findModelOrThrow({ position_id }, Position, {
		throwOnDeleted: true,
		messageOnDeleted: "Position is already deleted",
	});
	Validation.authority(branch_id, position.branch_id);

	await position.destroy({ transaction: extras.transaction });
	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Position deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById,
};