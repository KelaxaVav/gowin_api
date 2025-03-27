const { LeaveRequest, User, Role, Attendance } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const LeaveRequestService = require("../../services/leaveRequest");

const create = routeHandler(async (req, res, extras) => {
	const { type, purpose, date, start_at, end_at } = req.body;
	const { user_id } = req.auth;
	const { branch_id } = req.branch;

	const leaveRequest = await LeaveRequestService.createLeaveRequest({
		user_id,
		branch_id,
		type,
		purpose,
		date,
		start_at,
		end_at,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(leaveRequest, { message: 'Leave request created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(LeaveRequest, req.query, {
		defaultFilterObject: {
			'$user.role.branch_id$': branch_id,
		},
	});

	const leaveRequests = await LeaveRequest.findAll({
		...req.paginate,
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
		],
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(leaveRequests, {
		message: 'Leave requests loaded successfully',
		total: await LeaveRequest.count(),
	});
}, false);


const getById = routeHandler(async (req, res, extras) => {
	const { leave_request_id } = req.params;

	const leaveRequest = await findModelOrThrow({ leave_request_id }, LeaveRequest, {
		include: [
			{
				model: User,
				as: 'user',
			},
			{
				model: Attendance,
				as: 'attendance',
			},
		],
	});

	return res.sendRes(leaveRequest, { message: 'Leave request loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { leave_request_id } = req.params;
	const { user_id } = req.auth;
	const { branch_id } = req.branch;
	const { type, purpose, date, start_at, end_at } = req.body;

	const leaveRequest = await LeaveRequestService.updateLeaveRequest({
		leave_request_id,
		user_id,
		branch_id,
		type,
		purpose,
		date,
		start_at,
		end_at,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(leaveRequest, { message: 'Leave request updated successfully', status: STATUS_CODE.OK });
});

const updateStatus = routeHandler(async (req, res, extras) => {
	const { leave_request_id, status } = req.params;
	const { branch_id } = req.branch;

	const leaveRequest = await LeaveRequestService.updateStatus({
		leave_request_id,
		branch_id,
		status,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(leaveRequest, { message: 'Leave request updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { leave_request_id } = req.params;
	const { user_id } = req.auth;

	await LeaveRequestService.deleteLeaveRequest({ leave_request_id, user_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Leave request deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	updateStatus,
	deleteById,
};