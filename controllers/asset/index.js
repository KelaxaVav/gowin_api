const { Asset } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const AssetService = require("../../services/asset");

const create = routeHandler(async (req, res, extras) => {
	const { type, owner_id } = req.body;

	const { file } = req;

	const asset = await AssetService.createAsset({
		type,
		owner_id,
		file,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(asset, { message: 'Asset created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Asset, req.query);

	const assetes = await Asset.findAll({
		...req.paginate,
		order: [['id', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(assetes, {
		message: 'Assets loaded successfully',
		total: await Asset.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { asset_id } = req.params;

	const asset = await findModelOrThrow({ asset_id }, Asset);

	return res.sendRes(asset, { message: 'Asset loaded successfully', status: STATUS_CODE.OK });
}, false);

module.exports = {
	create,
	getAll,
	getById,
};