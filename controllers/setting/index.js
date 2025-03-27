const { Setting, Branch } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const SettingService = require("../../services/setting");

const create = routeHandler(async (req, res, extras) => {
	const { name, type, data } = req.body;

	const setting = await SettingService.createSetting({
		name,
		type,
		data,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(setting, { message: 'Setting created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Setting, req.query);

	const settings = await Setting.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(settings, {
		message: 'Settings loaded successfully',
		total: await Setting.count(),
	});
}, false);

const getAllByType = routeHandler(async (req, res, extras) => {
	const { type } = req.params;

	const data = await SettingService.findSettingsByType(type);

	return res.sendRes(data, {
		message: 'Settings loaded successfully',
		...req.meta,
		status: STATUS_CODE.OK,
	});

}, false);

const getByTypeName = routeHandler(async (req, res, extras) => {
	const { type, name } = req.params;

	const data = await SettingService.findSettingByName(type, name);

	return res.sendRes(data, {
		message: 'Setting loaded successfully',
		status: STATUS_CODE.OK,
	});

}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { setting_id } = req.params;

	const setting = await findModelOrThrow({ setting_id }, Setting);

	return res.sendRes(setting, { message: 'Setting loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { setting_id } = req.params;
	const { name, type, data } = req.body;

	const setting = await SettingService.updateSetting({
		setting_id,
		name,
		type,
		data,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(setting, { message: 'Setting updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { setting_id } = req.params;

	await SettingService.deleteSetting({ setting_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Setting deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getAllByType,
	getByTypeName,
	getById,
	updateById,
	deleteById,
};