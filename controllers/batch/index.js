const { Batch, InvoiceItem } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const BatchService = require("../../services/batch");

const create = routeHandler(async (req, res, extras) => {
	const {
		item_id,
		quantity,
		price,
		price_min,
	} = req.body;
	const { branch_id } = req.branch;

	const batch = await BatchService.createBatch(branch_id, {
		item_id,
		quantity,
		price,
		price_min,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(batch, { message: 'Batch created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Batch, req.query, { defaultFilterObject: { branch_id } });

	const batches = await Batch.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(batches, {
		message: 'Batches loaded successfully',
		total: await Batch.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { batch_id } = req.params;

	const batch = await findModelOrThrow({ batch_id }, Batch, {
		include: [
			{
				model: InvoiceItem,
				as: 'invoiceItems',
			},
		],
	});

	batch.dataValues.is_used = !!batch.invoiceItems.length;
	delete batch.dataValues.invoiceItems;

	return res.sendRes(batch, { message: 'Batch loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { batch_id } = req.params;
	const { branch_id } = req.branch;

	const {
		quantity,
		price,
		price_min,
	} = req.body;

	const batch = await BatchService.updateBatch(branch_id, {
		batch_id,
		quantity,
		price,
		price_min,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(batch, { message: 'Batch updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { batch_id } = req.params;
	const { branch_id } = req.branch;

	await BatchService.deleteBatch({ batch_id, branch_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Batch deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById,
};