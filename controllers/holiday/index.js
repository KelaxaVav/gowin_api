const { Holiday, Item, Branch } = require("../../models");
const { STATUS_CODE, arrayOrNotToArray } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow, Validation } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const HolidayService = require("../../services/holiday");
const { SCOPE_TYPES } = require("../../data/constants");
const { Op } = require("sequelize");

const create = routeHandler(async (req, res, extras) => {
	const { title, date, leave_type, day, type, scope } = req.body;
	const { branch_id } = req.branch;

	const holiday = await HolidayService.createHoliday({
		branch_id,
		title,
		date,
		leave_type,
		day,
		type,
		scope,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(holiday, { message: 'Holiday created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Holiday, req.query, {
		defaultMainOpAnd: [
			{
				[Op.or]: [
					{
						branch_id,
					},
					{
						branch_id: null,
					},
				]
			}
		],
	});

	const holidays = await Holiday.findAll({
		include: [
			{
				model: Branch,
				as: 'branch',
			}
		],
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(holidays, {
		message: 'Holidays loaded successfully',
		total: await Holiday.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { holiday_id } = req.params;

	const holiday = await findModelOrThrow({ holiday_id }, Holiday, {
		include: [
			{
				model: Branch,
				as: 'branch',
			},
		],
	});

	return res.sendRes(holiday, { message: 'Holiday loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { holiday_id } = req.params;
	const { branch_id } = req.branch;
	const { title, date, leave_type, day, scope } = req.body;

	const holiday = await HolidayService.updateHoliday({
		holiday_id,
		branch_id,
		title,
		date,
		leave_type,
		day,
		scope,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(holiday, { message: 'Holiday updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { holiday_id } = req.params;
	const { branch_id } = req.branch;

	await HolidayService.deleteHoliday({ holiday_id, branch_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Holiday deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById,
};