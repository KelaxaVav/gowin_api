const { Op } = require("sequelize");
const { HOLIDAY_TYPES, WEEKDAYS, HOLIDAY_LEAVE_TYPES, SCOPE_TYPES } = require("../data/constants");
const { Holiday } = require("../models");
const { findModelOrThrow, Validation, findModelAndThrow } = require("../utils/validation");
const { STATUS_CODE, ConvertTime } = require("../utils/utility");
const AppError = require("../utils/appError");

class HolidayService {
    /**
     * 
     * @param {{
     * branch_id:string
     * title:string
     * date:Date
     * leave_type:THolidayPresenceTypes
     * day:TWeekday
     * type:THolidayType
     * scope:TScopeType
     * }} param0 
     * @param {Extras} extras 
     */
    static async createHoliday({ branch_id, title, date, leave_type, day, type, scope }, extras) {
        Validation.isTrue(HOLIDAY_LEAVE_TYPES[leave_type]);

        /** @type {THoliday} */
        let holidayData;
        if (type == HOLIDAY_TYPES.WEEKLY) {
            Validation.isTrue(WEEKDAYS[day]);

            await findModelAndThrow({
                day,
                type,
            }, Holiday);

            holidayData = {
                title: 'Weekly leave',
                day,
                leave_type,
                type,
            }
        } else if (type == HOLIDAY_TYPES.CUSTOM) {
            Validation.nullParameters([date, title]);
            Validation.isTrue(SCOPE_TYPES[scope]);
            // check permission for public holiday creation

            await findModelAndThrow({
                date,
                type,
                branch_id: scope == SCOPE_TYPES.PRIVATE ? {
                    [Op.or]: [branch_id, null]
                } : null,
            }, Holiday);

            holidayData = {
                title,
                branch_id: scope == SCOPE_TYPES.PRIVATE ? branch_id : null,
                date,
                leave_type,
                type,
            }
        }

        const holiday = await Holiday.create(holidayData, { transaction: extras.transaction });

        return holiday;
    }

    /**
    * 
    * @param {{
    * holiday_id:string
    * branch_id:string
    * title:string
    * date:Date
    * leave_type:TAttendanceStatus
    * day:TWeekday
    * type:THolidayType
    * scope:TScopeType
    * }} param0 
    * @param {Extras} extras 
    */
    static async updateHoliday({ holiday_id, branch_id, title, date, leave_type, day, scope }, extras) {
        /** @type {THoliday} */
        const holiday = await findModelOrThrow({ holiday_id }, Holiday);

        if (holiday.branch_id) {
            Validation.authority(branch_id, holiday.branch_id);
        }
        // else check permission

        Validation.isTrue(HOLIDAY_LEAVE_TYPES[leave_type]);

        /** @type {THoliday} */
        let holidayData;
        if (holiday.type == HOLIDAY_TYPES.WEEKLY) {
            Validation.isTrue(WEEKDAYS[day]);

            await findModelAndThrow({
                day,
                holiday_id: {
                    [Op.not]: holiday_id,
                },
            }, Holiday);

            holidayData = {
                day,
                leave_type,
            }
        } else if (holiday.type == HOLIDAY_TYPES.CUSTOM) {
            Validation.nullParameters([date, title]);
            Validation.isTrue(SCOPE_TYPES[scope]);

            await findModelAndThrow({
                date,
                branch_id: scope == SCOPE_TYPES.PRIVATE ? {
                    [Op.or]: [branch_id, null]
                } : null,
                holiday_id: {
                    [Op.not]: holiday_id,
                },
            }, Holiday);

            holidayData = {
                title,
                branch_id: scope == SCOPE_TYPES.PRIVATE ? branch_id : null,
                date,
                leave_type,
                scope,
            }
        }

        await holiday.update(holidayData, { transaction: extras.transaction });

        return holiday;
    }

    /**
     * 
     * @param {{
     * holiday_id:string
     * branch_id:string
     * }} param0 
     * @param {Extras} extras 
     */
    static async deleteHoliday({ holiday_id, branch_id }, extras) {
        const holiday = await findModelOrThrow({ holiday_id }, Holiday, {
            throwOnDeleted: true,
            messageOnDeleted: "Holiday is already deleted",
        });

        if (holiday.branch_id) {
            Validation.authority(branch_id, holiday.branch_id);
        }
        // else check permission

        await holiday.destroy({ transaction: extras.transaction });

    }

    /**
     * Validate custom leave
     * @param {{
     * branch_id:string
     * date:Date
     * }} param0
     * @returns {Promise<THoliday>} 
     */
    static async validateLeave({ branch_id, date }) {
        const day = ConvertTime.toWeekDay(date);

        /** @type {THoliday} */
        const holiday = await Holiday.findOne({
            where: {
                [Op.or]: [
                    {
                        day,
                        type: HOLIDAY_TYPES.WEEKLY,
                    },
                    {
                        date,
                        branch_id: {
                            [Op.or]: [branch_id, null],
                        },
                        type: HOLIDAY_TYPES.CUSTOM,
                    },
                ],
            },
        });

        if (holiday?.leave_type == HOLIDAY_LEAVE_TYPES.FULL) {
            throw new AppError(`Cannot add attendance for ${holiday.title.toLowerCase()} holiday`, STATUS_CODE.BAD_REQUEST);
        }

        return holiday;
    }
}

module.exports = HolidayService;