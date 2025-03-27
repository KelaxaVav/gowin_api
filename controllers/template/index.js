const { Template, Branch } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const TemplateService = require("../../services/template");
const { Op } = require("sequelize");

const create = routeHandler(async (req, res, extras) => {
	const { name, type, data } = req.body;
	const { branch_id } = req.branch;

	const template = await TemplateService.createTemplate({
		name,
		type,
		data,
		branch_id,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(template, { message: 'Template created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Template, req.query, {
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

	const templates = await Template.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(templates, {
		message: 'Templates loaded successfully',
		total: await Template.count(),
	});
}, false);

const getAllByType = routeHandler(async (req, res, extras) => {
	const { type } = req.params;
	const { branch_id } = req.branch;

	const data = await TemplateService.findTemplatesByType(branch_id, type);

	return res.sendRes(data, {
		message: 'Templates loaded successfully',
		status: STATUS_CODE.OK,
	});

}, false);

const getByTypeName = routeHandler(async (req, res, extras) => {
	const { type, name } = req.params;
	const { branch_id } = req.branch;

	/** @type {TTemplate} */
	const template = await findModelOrThrow({
		name,
		type,
		[Op.or]: [
			{
				branch_id,
			},
			{
				branch_id: null,
			},
		]
	}, Template);

	return res.sendRes(template.data, {
		message: 'Template loaded successfully',
		status: STATUS_CODE.OK,
	});

}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { template_id } = req.params;

	const template = await findModelOrThrow({ template_id }, Template, {
		include: [
			{
				model: Branch,
				as: 'branch',
			},
		],
	});

	return res.sendRes(template, { message: 'Template loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { template_id } = req.params;
	const { name, type, data, status } = req.body;
	const { branch_id } = req.branch;

	const template = await TemplateService.updateTemplate({
		template_id,
		branch_id,
		name,
		type,
		data,
		status,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(template, { message: 'Template updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { template_id } = req.params;
	const { branch_id } = req.branch;

	await TemplateService.deleteTemplate({ template_id, branch_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Template deleted successfully', status: STATUS_CODE.OK });
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