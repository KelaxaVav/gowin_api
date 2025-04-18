const { PartnerType } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const PartnerTypeService = require("../../services/partnerType");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { name, is_active } = req.body;

	const partnerTypes = await PartnerTypeService.createType({
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(partnerTypes, { message: 'Partner Type created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(PartnerType, req.query);

	const partnerTypes = await PartnerType.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(partnerTypes, {
		message: 'Partner Types loaded successfully',
		total: await PartnerType.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { partner_type_id } = req.params;

	// /** @type {TTransfer} */
	const team = await findModelOrThrow({ partner_type_id }, PartnerType);


	return res.sendRes(team, { message: 'Partner Type loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { partner_type_id } = req.params;
	const { name, is_active } = req.body;

	const team = await PartnerTypeService.updateTypes({
		partner_type_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(team, { message: 'Partner Type updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { partner_type_id } = req.params;

	await PartnerTypeService.deleteType({ partner_type_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Partner Type deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};