const { Op } = require("sequelize");
const { LEAVE_REQUEST_TYPES, LEAVE_REQUEST_PURPOSES, LEAVE_REQUEST_STATUSES, ATTENDANCE_STATUSES } = require("../data/constants");
const { LeaveRequest, User, Role, Attendance } = require("../models");
const { findModelOrThrow, Validation, findModelAndThrow } = require("../utils/validation");
const { STATUS_CODE, ConvertTime, firstLetterCapital } = require("../utils/utility");
const AppError = require("../utils/appError");
const AttendanceService = require("./attendance");
const HolidayService = require("./holiday");

class LeaveRequestService {
    /**
     * 
     * @param {{
     * user_id:string
     * branch_id:string
     * type:TLeaveRequestType
     * purpose:TLeaveRequestPurpose
     * date:Date
     * start_at:Date
     * end_at:Date
     * }} param0 
     */
    static async validateRequestedDate({ branch_id, date, start_at, end_at, purpose, type, user_id }) {
        Validation.nullParameters([type, purpose, date]);
        Validation.isTrue(LEAVE_REQUEST_TYPES[type]);
        Validation.isTrue(LEAVE_REQUEST_PURPOSES[purpose]);

        type != LEAVE_REQUEST_TYPES.FULL && Validation.nullParameters([start_at, end_at]);

        /** @type {TAttendance} */
        const findAttendance = await Attendance.findOne({
            where: {
                date,
                user_id,
            },
        });
        Validation.isTrue(!findAttendance || findAttendance.status != ATTENDANCE_STATUSES.PRESENT, {
            message: `Cannot create leave request for ${findAttendance?.status.toLowerCase()} attendance`,
        });

        const holiday = await HolidayService.validateLeave({ branch_id, date });
        if (type == LEAVE_REQUEST_TYPES.HALF) {
            Validation.isTrue(!holiday, { message: `Cannot request half day leave on ${holiday?.title.toLowerCase()} holiday` });
        }
    }

    /**
     * 
     * @param {{
     * user_id:string
     * branch_id:string
     * type:TLeaveRequestType
     * purpose:TLeaveRequestPurpose
     * date:Date
     * start_at:Date
     * end_at:Date
     * }} param0 
     * @param {Extras} extras 
     */
    static async createLeaveRequest({ user_id, branch_id, type, purpose, date, start_at, end_at }, extras) {
        await this.validateRequestedDate({ branch_id, date, start_at, end_at, purpose, type, user_id });

        /** @type {TLeaveRequest} */
        const findLeaveRequest = await LeaveRequest.findOne({
            where: {
                date,
                user_id,
                status: {
                    [Op.in]: [LEAVE_REQUEST_STATUSES.APPROVED, LEAVE_REQUEST_STATUSES.PENDING],
                },
            },
        });
        Validation.isTrue(!findLeaveRequest, {
            message: `${firstLetterCapital(findLeaveRequest?.status)} leave request is already exist on this date`,
        });

        /** @type {TLeaveRequest} */
        const leaveRequestData = {
            user_id,
            type,
            purpose,
            date,
            start_at: type != LEAVE_REQUEST_TYPES.FULL ? start_at : null,
            end_at: type != LEAVE_REQUEST_TYPES.FULL ? end_at : null,
        }

        const leaveRequest = await LeaveRequest.create(leaveRequestData, { transaction: extras.transaction });

        return leaveRequest;
    }

    /**
     * 
     * @param {{
     * leave_request_id:string
     * user_id:string
     * branch_id:string
     * type:TLeaveRequestType
     * purpose:TLeaveRequestPurpose
     * date:Date
     * start_at:Date
     * end_at:Date
     * }} param0 
     * @param {Extras} extras 
     */
    static async updateLeaveRequest({ leave_request_id, user_id, branch_id, type, purpose, date, start_at, end_at }, extras) {
        /** @type {TLeaveRequest} */
        const leaveRequest = await findModelOrThrow({ leave_request_id, user_id }, LeaveRequest);

        Validation.isTrue(leaveRequest.status == LEAVE_REQUEST_STATUSES.PENDING, {
            message: `${firstLetterCapital(leaveRequest.status)} leave request cannot be updated`,
        });

        await this.validateRequestedDate({ branch_id, date, start_at, end_at, purpose, type, user_id });

        /** @type {TLeaveRequest} */
        const findLeaveRequest = await LeaveRequest.findOne({
            where: {
                date,
                user_id,
                leave_request_id: {
                    [Op.not]: leave_request_id,
                },
                status: {
                    [Op.in]: [LEAVE_REQUEST_STATUSES.APPROVED, LEAVE_REQUEST_STATUSES.PENDING],
                },
            },
        });
        Validation.isTrue(!findLeaveRequest, {
            message: `${firstLetterCapital(findLeaveRequest?.status)} leave request is already exist on this date`,
        });

        /** @type {TLeaveRequest} */
        const leaveRequestData = {
            type,
            purpose,
            date,
            start_at: type != LEAVE_REQUEST_TYPES.FULL ? start_at : null,
            end_at: type != LEAVE_REQUEST_TYPES.FULL ? end_at : null,
        }

        await leaveRequest.update(leaveRequestData, { transaction: extras.transaction });

        return leaveRequest;
    }

    /**
     * 
     * @param {{
     * leave_request_id:string
     * branch_id:string
     * status:TLeaveRequestStatus
     * }} param0 
     * @param {Extras} extras 
     */
    static async updateStatus({ leave_request_id, branch_id, status }, extras) {
        /** @type {TLeaveRequest} */
        const leaveRequest = await findModelOrThrow({ leave_request_id }, LeaveRequest, {
            include: [
                {
                    model: User,
                    as: 'user',
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                },
                {
                    model: Attendance,
                    as: 'attendance',
                },
            ],
        });
        Validation.authority(branch_id, leaveRequest.user.role.branch_id);
        Validation.isTrue(leaveRequest.status != status, {
            message: `Leave request is already ${leaveRequest.status}`,
        });

        if ([LEAVE_REQUEST_STATUSES.APPROVED, LEAVE_REQUEST_STATUSES.REJECTED].includes(status)) {
            const { user_id, type, date, start_at, end_at } = leaveRequest;

            /** @type {TAttendance} */
            const findAttendance = await Attendance.findOne({
                include: [
                    {
                        model: LeaveRequest,
                        as: 'leaveRequest',
                    },
                ],
                where: {
                    date,
                    user_id,
                },
            });

            const holiday = await HolidayService.validateLeave({ branch_id, date });
            if (type == LEAVE_REQUEST_TYPES.HALF) {
                Validation.isTrue(!holiday, { message: `Cannot take half day leave on ${holiday?.title.toLowerCase()} holiday` });
            }

            if (findAttendance) {
                // update

                Validation.isTrue(findAttendance.status != ATTENDANCE_STATUSES.PRESENT, {
                    message: `Cannot approve or reject leave request for ${findAttendance?.status.toLowerCase()} attendance`,
                });

                // cannot approve or reject on a approved or rejected date
                Validation.isTrue(!findAttendance.leave_request_id || findAttendance.leave_request_id == leave_request_id, {
                    message: `${firstLetterCapital(findAttendance?.leaveRequest?.status)} leave request is already exist on this date`,
                });

                await findAttendance.update({ leave_request_id }, { transaction: extras.transaction });
            } else {
                // create

                let attendanceStatus;
                switch (type) {
                    case LEAVE_REQUEST_TYPES.FULL:
                        attendanceStatus = ATTENDANCE_STATUSES.LEAVE;
                        break;
                    case LEAVE_REQUEST_TYPES.HALF:
                        attendanceStatus = ATTENDANCE_STATUSES.HALF_DAY;
                        break;
                    case LEAVE_REQUEST_TYPES.CUSTOM:
                        attendanceStatus = ATTENDANCE_STATUSES.CUSTOM;
                        break;
                }

                await AttendanceService.addBulkAttendance({
                    branch_id,
                    date,
                    attendances: [{
                        user_id,
                        start_at,
                        end_at,
                        status: attendanceStatus,
                        leave_request_id,
                    }],
                }, extras);
            }

        } else {
            if (leaveRequest.attendance) {
                await leaveRequest.attendance.update({ leave_request_id: null }, { transaction: extras.transaction });
            }
        }

        await leaveRequest.update({ status }, { transaction: extras.transaction });

        return leaveRequest;
    }

    /**
     * 
     * @param {{
     * leave_request_id:string
     * user_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteLeaveRequest({ leave_request_id, user_id }, extras) {
        const leaveRequest = await findModelOrThrow({ leave_request_id }, LeaveRequest, {
            throwOnDeleted: true,
            messageOnDeleted: "LeaveRequest is already deleted",
        });

        Validation.isTrue(leaveRequest.status == LEAVE_REQUEST_STATUSES.PENDING, {
            message: `${firstLetterCapital(leaveRequest.status)} leave request cannot be deleted`,
        });

        if (leaveRequest.user_id) {
            Validation.authority(user_id, leaveRequest.user_id);
        }

        await leaveRequest.destroy({ transaction: extras.transaction });

    }
}

module.exports = LeaveRequestService;