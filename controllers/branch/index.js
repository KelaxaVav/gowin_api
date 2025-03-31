const { Branch, Region } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const BranchService = require("../../services/branch");

const create = routeHandler(async (req, res, extras) => {
	const { name, region_id, is_active } = req.body;

	const branch = await BranchService.createBranch({
		name,
		region_id,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(branch, { message: 'Branch created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Branch, req.query);

	const branches = await Branch.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Region,
				as: 'region',
			},
		],
		where: whereOption,
	});

	return res.sendRes(branches, {
		message: 'Branches loaded successfully',
		total: await Branch.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.params;

	const branch = await findModelOrThrow({ branch_id }, Branch);

	return res.sendRes(branch, { message: 'Branch loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.params;

	const {
		name,
		contact,
		address,
		code,
		settings,
	} = req.body;

	const branch = await BranchService.updateBranch({
		branch_id,
		name,
		contact,
		address,
		code,
		settings,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(branch, { message: 'Branch updated successfully', status: STATUS_CODE.OK });
});

const updateByAuth = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;

	const {
		name,
		contact,
		address,
		code,
		settings,
	} = req.body;

	const branch = await BranchService.updateBranch({
		branch_id,
		name,
		contact,
		address,
		code,
		settings,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(branch, { message: 'Branch updated successfully', status: STATUS_CODE.OK });
});

const updateSettingsByAuth = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;

	const branch = await BranchService.updateBranchSettings({
		branch_id,
		settings: req.body,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(branch, { message: 'Branch settings updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.params;

	await BranchService.deleteBranch(branch_id, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Branch deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	updateByAuth,
	updateSettingsByAuth,
	deleteById,
};