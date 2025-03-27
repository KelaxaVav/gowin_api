const { User, Role, Branch, Category, Position, Permission } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");

const { whereSearchAndFilter } = require("../../helper/common");
const UserService = require("../../services/user");

const create = routeHandler(async (req, res, extras) => {
	const {
		name,
		email,
		nic,
		mobile,
		password,
		confirm_password,
		role_id,
		position_id,
		salary,
	} = req.body;

	const { branch_id } = req.branch;

	const user = await UserService.createUser({
		branch_id,
		name,
		email,
		nic,
		mobile,
		password,
		confirm_password,
		role_id,
		position_id,
		salary,
	}, extras);

	await extras.transaction.commit();

	return res.sendRes(user, { message: 'User created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(User, req.query);

	const users = await User.findAll({
		include: [
			{
				model: Role,
				as: 'role',
				where: {
					branch_id,
				},
			},
			{
				model: Position,
				as: 'position',
			}
		],
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(users, {
		message: 'Users loaded successfully',
		total: await User.count(),
		status: STATUS_CODE.OK,
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { user_id } = req.params;

	const user = await findModelOrThrow({ user_id }, User, {
		include: [
			{
				model: Role,
				as: 'role',
			},
		],
		throwOnDeleted: true,
	});

	return res.sendRes(user, { message: 'User loaded successfully', status: STATUS_CODE.OK });
}, false);

const getProfile = routeHandler(async (req, res, extras) => {
	const { user_id } = req.auth;

	const user = await findModelOrThrow({ user_id }, User, {
		include: [
			{
				model: Role,
				as: 'role',
				include: [
					{
						model: Branch,
						as: 'branch',
						include: [
							{
								model: Category,
								as: 'mainCategories',
							},
						],
					},
					{
						model: Permission,
						as: 'permissions',
					},
				],
			},
		],
		throwOnDeleted: true,
	});

	user.role.branch.dataValues.mainCategories = user.role.branch.mainCategories.reduce((data, category) => {
		data[category.name] = category;
		return data;
	}, {});

	user.dataValues.permissions = user.role.permissions.reduce((data, permission) => {
		data.push(permission.name);
		return data;
	}, []);

	delete user.role.dataValues.permissions;

	return res.sendRes(user, { message: 'User profile loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateProfile = routeHandler(async (req, res, extras) => {
	const { user_id } = req.auth;

	const {
		name,
		email,
		mobile,
	} = req.body;

	const user = await UserService.updateProfile({
		user_id,
		name,
		email,
		mobile,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(user, { message: 'User profile updated successfully', status: STATUS_CODE.OK });
});

const updateById = routeHandler(async (req, res, extras) => {
	const { user_id } = req.params;
	const { branch_id } = req.branch;

	const {
		name,
		email,
		nic,
		mobile,
		password,
		confirm_password,
		role_id,
		position_id,
		salary,
	} = req.body;

	const user = await UserService.updateUser({
		user_id,
		branch_id,
		name,
		email,
		nic,
		mobile,
		password,
		confirm_password,
		role_id,
		position_id,
		salary,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(user, { message: 'User updated successfully', status: STATUS_CODE.OK });
});

const changePassword = routeHandler(async (req, res, extras) => {
	const { user_id } = req.auth;
	const {
		current_password,
		password,
		confirm_password,
	} = req.body;

	await UserService.changePassword({
		user_id,
		current_password,
		password,
		confirm_password,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'User password changed successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { user_id } = req.params;
	const { branch_id } = req.branch;

	await UserService.deleteUser({ user_id, branch_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'User deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	getProfile,
	updateById,
	updateProfile,
	changePassword,
	deleteById,
};