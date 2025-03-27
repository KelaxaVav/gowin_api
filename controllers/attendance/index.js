const { Attendance, User, Role, LeaveRequest } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const AttendanceService = require("../../services/attendance");

const create = routeHandler(async (req, res, extras) => {
	const { date, attendances } = req.body;
	const { branch_id } = req.branch;

	const newAttendances = await AttendanceService.addBulkAttendance({
		branch_id,
		date,
		attendances,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(newAttendances, { message: 'Attendances created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Attendance, req.query, {
		defaultFilterObject: {
			'$user.role.branch_id$': branch_id,
		},
	});

	const attendances = await Attendance.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: User,
				as: 'user',
				include: [
					{
						model: Role,
						as: 'role',
						attributes: [],
					},
				],
			},
			{
				model: LeaveRequest,
				as: 'leaveRequest',
			},
		],
		where: whereOption,
	});

	return res.sendRes(attendances, {
		message: 'Attendances loaded successfully',
		total: await Attendance.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { attendance_id } = req.params;

	const attendance = await findModelOrThrow({ attendance_id }, Attendance, {
		include: [
			{
				model: User,
				as: 'user',
			},
			{
				model: LeaveRequest,
				as: 'leaveRequest',
			},
		],
	});

	return res.sendRes(attendance, { message: 'Attendance loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { attendance_id } = req.params;
	const { branch_id } = req.branch;
	const { user_id, start_at, end_at, date, status } = req.body;

	const attendance = await AttendanceService.updateAttendance({
		attendance_id,
		branch_id,
		user_id,
		start_at,
		end_at,
		date,
		status,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(attendance, { message: 'Attendance updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { attendance_id } = req.params;
	const { branch_id } = req.branch;

	await AttendanceService.deleteAttendance({ attendance_id, branch_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Attendance deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById,
};