const { RTOCategory, State, Insurer, RTO } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const RTOCategoryService = require("../../services/rtoCategory");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { state_id, insurer_id, rto_ids, name, is_active } = req.body;

	const rtoCategory = await RTOCategoryService.createRTOCategory({
		state_id,
		insurer_id,
		name,
		rto_ids,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(rtoCategory, { message: 'RTO Category created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(RTOCategory, req.query);

	const rtoCategories = await RTOCategory.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Insurer,
				as: 'insurer',
			},
		],
		where: whereOption,
	});

	return res.sendRes(rtoCategories, {
		message: 'RTO CATEGORYloaded successfully',
		total: await RTOCategory.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { rto_category_id } = req.params;

	const rtoCategory = await findModelOrThrow({ rto_category_id }, RTOCategory, {
		include: [
			{
				model: RTO,
				as: 'rtos',
				include: [
					{
						model: State,
						as: 'state',
					}
				]
			},
			{
				model: Insurer,
				as: 'insurer',
			},
		]
	});


	return res.sendRes(rtoCategory, { message: 'RTO Category loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { rto_category_id } = req.params;
	const { state_id, insurer_id, name, rto_ids, is_active } = req.body;

	const rtoCategory = await RTOCategoryService.updateRTOCategory({
		rto_category_id,
		state_id,
		insurer_id,
		name,
		rto_ids,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(rtoCategory, { message: 'RTO Category updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { rto_category_id } = req.params;

	await RTOCategoryService.deleteRTOCategory({ rto_category_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'RTO Category deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};