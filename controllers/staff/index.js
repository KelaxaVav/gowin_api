const { Role, Branch, Category, Permission, Staff, Designation, City, State } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");

const { whereSearchAndFilter } = require("../../helper/common");
const StaffService = require("../../services/staff");

const create = routeHandler(async (req, res, extras) => {
	const {
		name,
		email,
		mobile_no,
		password,
		confirm_password,
		role,
		blood_group,
		city_id,
		designation_id,
		dob,
		door_no,
		is_active,
		pin_code,
		street,
		team_id,
		branch_id,
	} = req.body;

	const staff = await StaffService.createStaff({
		branch_id,
		name,
		email,
		mobile_no,
		password,
		confirm_password,
		role,
		blood_group,
		city_id,
		designation_id,
		dob,
		door_no,
		is_active,
		pin_code,
		street,
		team_id,
	}, extras);

	await extras.transaction.commit();

	return res.sendRes(staff, { message: 'Staff created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Staff, req.query);

	const staffs = await Staff.findAll({
		include: [
			{
				model: Designation,
				as: 'designation',
			},
			{
				model: Branch,
				as: 'branch',
			},
			{
				model: City,
				as: 'city',
				include: [
					{
						model: State,
						as: 'state',
					},
				]
			},
		],
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(staffs, {
		message: 'Staffs loaded successfully',
		total: await Staff.count(),
		status: STATUS_CODE.OK,
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { staff_id } = req.params;

	const staff = await findModelOrThrow({ staff_id }, Staff, {
		throwOnDeleted: true,
		include: [
			{
				model: Designation,
				as: 'designation',
			},
			{
				model: Branch,
				as: 'branch',
			},
			{
				model: City,
				as: 'city',
				include: [
					{
						model: State,
						as: 'state',
					},
				]
			},
		],
	});

	return res.sendRes(staff, { message: 'Staff loaded successfully', status: STATUS_CODE.OK });
}, false);

const getProfile = routeHandler(async (req, res, extras) => {
	const { staff_id } = req.auth;

	const staff = await findModelOrThrow({ staff_id }, Staff, {
		include: [
			{
				model: Branch,
				as: 'branch',
			},
		],
		throwOnDeleted: true,
	});

	return res.sendRes(staff, { message: 'Staff profile loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateProfile = routeHandler(async (req, res, extras) => {
	const { staff_id } = req.auth;

	const {
		name,
		email,
		mobile,
	} = req.body;

	const staff = await StaffService.updateProfile({
		staff_id,
		name,
		email,
		mobile,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(staff, { message: 'Staff profile updated successfully', status: STATUS_CODE.OK });
});

const updateById = routeHandler(async (req, res, extras) => {
	const { staff_id } = req.params;

	const { blood_group, city_id, confirm_password, designation_id, dob, door_no, email,
		is_active, mobile_no, name, password, pin_code, role, street, team_id } = req.body;

	const staff = await StaffService.updateStaff({
		staff_id,
		blood_group,
		city_id,
		confirm_password,
		designation_id,
		dob,
		door_no,
		email,
		is_active,
		mobile_no,
		name,
		password,
		pin_code,
		role,
		street,
		team_id,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(staff, { message: 'Staff updated successfully', status: STATUS_CODE.OK });
});

const changePassword = routeHandler(async (req, res, extras) => {
	const { staff_id } = req.auth;
	const {
		current_password,
		password,
		confirm_password,
	} = req.body;

	await StaffService.changePassword({
		staff_id,
		current_password,
		password,
		confirm_password,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Staff password changed successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { staff_id } = req.params;

	await StaffService.deleteStaff({ staff_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Staff deleted successfully', status: STATUS_CODE.OK });
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