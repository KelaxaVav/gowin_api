const { Role, Permission } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { Validation, findModelAndThrow, findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const { Op } = require("sequelize");
const { parsePermissions } = require("../../helper/permission");

const create = routeHandler(async (req, res, extras) => {
	const { name } = req.body;
	const { branch_id } = req.branch;

	Validation.nullParameters([name]);

	await findModelAndThrow({ name, branch_id }, Role);

	const role = await Role.create({ name, branch_id }, { transaction: extras.transaction });
	await extras.transaction.commit();
	return res.sendRes(role, { message: 'Role created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Role, req.query);

	const roles = await Role.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(roles, {
		message: 'Roles loaded successfully',
		total: await Role.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { role_id } = req.params;

	const role = await findModelOrThrow({ role_id }, Role, {
		throwOnDeleted: true,
		include: [
			{
				model: Permission,
				as: 'permissions',
			}
		],
	});

	delete role.dataValues.permissions;
	role.dataValues.modulePermissions = role.permissions.map(permission => permission.permission_id);

	return res.sendRes(role, { message: 'Role loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { role_id } = req.params;
	const { branch_id } = req.branch;

	const { name } = req.body;
	Validation.nullParameters([name]);

	const role = await findModelOrThrow({ role_id }, Role);
	Validation.authority(branch_id, role.branch_id);

	await findModelAndThrow({
		name,
		role_id: {
			[Op.not]: role_id,
		},
		branch_id,
	}, Role);

	await role.update({ name }, { transaction: extras.transaction });

	await extras.transaction.commit();
	return res.sendRes(role, { message: 'Role updated successfully', status: STATUS_CODE.OK });
});

const setPermissions = routeHandler(async (req, res, extras) => {
	const { role_id } = req.params;
	const { branch_id } = req.branch;
	const { permissions } = req.body;

	Validation.emptyArrayParameters(permissions);

	const role = await findModelOrThrow({ role_id }, Role);
	Validation.authority(branch_id, role.branch_id);

	const findPermissions = await Permission.findAll({
		where: {
			permission_id: {
				[Op.in]: permissions,
			},
		},
	});

	Validation.isTrue(findPermissions.length == permissions.length);

	await role.setPermissions(findPermissions, { transaction: extras.transaction });

	await extras.transaction.commit();
	return res.sendRes(role, { message: 'Permissions updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { role_id } = req.params;
	const { branch_id } = req.branch;

	const role = await findModelOrThrow({ role_id }, Role, {
		throwOnDeleted: true,
		messageOnDeleted: "Role is already deleted",
	});
	Validation.authority(branch_id, role.branch_id);

	await role.destroy({ transaction: extras.transaction });
	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Role deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	setPermissions,
	deleteById,
};