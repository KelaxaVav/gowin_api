const { Permission } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { Validation, findModelAndThrow, findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const { Op } = require("sequelize");
const { parsePermissions } = require("../../helper/permission");

const create = routeHandler(async (req, res, extras) => {
	const { name } = req.body;

	Validation.nullParameters([name]);
	await findModelAndThrow({ name }, Permission);

	const permission = await Permission.create({ name, }, { transaction: extras.transaction });
	await extras.transaction.commit();
	return res.sendRes(permission, { message: 'Permission created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Permission, req.query);

	const permissions = await Permission.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	const modulePermissions = parsePermissions(permissions);

	return res.sendRes(Object.keys(modulePermissions).map(key => modulePermissions[key]), {
		message: 'Permissions loaded successfully',
		total: await Permission.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { permission_id } = req.params;

	const permission = await findModelOrThrow({ permission_id }, Permission, { throwOnDeleted: true });

	return res.sendRes(permission, { message: 'Permission loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { permission_id } = req.params;

	const { name } = req.body;

	Validation.nullParameters([name]);

	const permission = await findModelOrThrow({ permission_id }, Permission);
	await findModelAndThrow({
		permission_id: {
			[Op.not]: permission_id
		},
		name
	}, Permission, {
		throwOnDeleted: true,
	});

	await permission.update({ name }, { transaction: extras.transaction });

	await extras.transaction.commit();
	return res.sendRes(permission, { message: 'Permission updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { permission_id } = req.params;

	const permission = await findModelOrThrow({ permission_id }, Permission, {
		throwOnDeleted: true,
		messageOnDeleted: "Permission is already deleted",
	});

	await permission.destroy({ transaction: extras.transaction });
	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Permission deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById,
};