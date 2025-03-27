const { Op } = require("sequelize");
const { ATTENDANCE_STATUSES, } = require("../data/constants");
const { Attendance, User, Role, LeaveRequest } = require("../models");
const { findModelOrThrow, Validation, findModelAndThrow } = require("../utils/validation");
const UserService = require("./user");
const HolidayService = require("./holiday");

class AttendanceService {
    /**
     * 
     * @param {{
     * branch_id:string
     * date:Date
     * attendances:TAttendance[]
     * }} param0 
     * @param {Extras} extras 
     * @returns 
     */
    static async addBulkAttendance({ branch_id, date, attendances }, extras) {
        Validation.emptyArrayParameters(attendances);

        await UserService.validateUsersWithBranch(branch_id, attendances);
        await findModelAndThrow({
            [Op.or]: attendances.map(att => ({
                date,
                user_id: att.user_id,
            })),
        }, Attendance);

        const holiday = await HolidayService.validateLeave({ branch_id, date });

        const attendanceData = attendances.map((attendance) => {
            const { user_id, status, start_at, end_at } = attendance;
            Validation.isTrue(ATTENDANCE_STATUSES[status]);

            let startAt = null;
            let endAt = null;
            if ([ATTENDANCE_STATUSES.HALF_DAY, ATTENDANCE_STATUSES.CUSTOM].includes(status)) {
                Validation.nullParameters([start_at, end_at]);
                startAt = start_at;
                endAt = end_at;
            }

            if (status == ATTENDANCE_STATUSES.HALF_DAY) {
                Validation.isTrue(!holiday, { message: `Cannot add half presence on ${holiday?.title.toLowerCase()} holiday` });
            }

            /** @type {TAttendance} */
            const newAttendance = {
                date,
                status,
                user_id,
                start_at: startAt,
                end_at: endAt,
            }

            return newAttendance;
        });

        const newAttendances = await Attendance.bulkCreate(attendanceData, { transaction: extras.transaction });
        return newAttendances;
    }

    /**
     * 
     * @param {{
     * branch_id:string
     * attendance_id:string
     * user_id:string
     * date:Date
     * start_at:Date
     * end_at:Date
     * status:TAttendanceStatus
     * }} param0 
     * @param {*} extras 
     * @returns 
     */
    static async updateAttendance({ attendance_id, branch_id, user_id, start_at, end_at, date, status }, extras) {
        /** @type {TAttendance} */
        const attendance = await findModelOrThrow({ attendance_id }, Attendance, {
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
                    model: LeaveRequest,
                    as: 'leaveRequest',
                },
            ],
        });
        Validation.authority(branch_id, attendance.user.role.branch_id);

        await UserService.validateUsersWithBranch(branch_id, [{ user_id }]);

        const holiday = await HolidayService.validateLeave({ branch_id, date });

        await findModelAndThrow({
            date,
            user_id,
            attendance_id: {
                [Op.not]: attendance_id,
            },
        }, Attendance);

        // cannot update approved or rejected date
        Validation.isTrue(!attendance.leaveRequest || attendance.date == date, {
            message: `Cannot update date of an attendance existing with a ${attendance.leaveRequest?.status.toLowerCase()} leave request`,
        });
        Validation.isTrue(ATTENDANCE_STATUSES[status]);

        let startAt = null;
        let endAt = null;
        if ([ATTENDANCE_STATUSES.HALF_DAY, ATTENDANCE_STATUSES.CUSTOM].includes(status)) {
            Validation.nullParameters([start_at, end_at]);
            startAt = start_at;
            endAt = end_at;
        }

        if (status == ATTENDANCE_STATUSES.HALF_DAY) {
            Validation.isTrue(!holiday, { message: `Cannot add half presence on ${holiday?.title.toLowerCase()} holiday` });
        }

        await attendance.update({
            user_id,
            start_at: startAt,
            end_at: endAt,
            date,
            status,
        }, { transaction: extras.transaction });

        delete attendance.dataValues.user;

        return attendance;
    }

    /**
     * 
     * @param {{
     *  attendance_id:string
     *  branch_id:string
     * }} param0 
     * @param {*} extras 
     */
    static async deleteAttendance({ attendance_id, branch_id }, extras) {
        /** @type {TAttendance} */
        const attendance = await findModelOrThrow({ attendance_id }, Attendance, {
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
                    model: LeaveRequest,
                    as: 'leaveRequest',
                },
            ],
        });
        Validation.authority(branch_id, attendance.user.role.branch_id);
        Validation.isTrue(!attendance.leaveRequest, {
            message: `Cannot update date of an attendance existing with a ${attendance.leaveRequest.status} leave request`,
        });

        await attendance.destroy({ transaction: extras.transaction });
    }
}

module.exports = AttendanceService;