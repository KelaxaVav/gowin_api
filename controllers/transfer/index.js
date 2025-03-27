const { Transfer, Branch, TransferItem, Batch, Item, Category } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const TransferService = require("../../services/transfer");
const { Op } = require("sequelize");

const create = routeHandler(async (req, res, extras) => {
	const { status, type, transfer_from, transfer_to, transferred_at, transferItems } = req.body;
	const { branch_id } = req.branch;

	const { transfer_id } = await TransferService.createTransfer({
		type,
		branch_id,
		transfer_from,
		transfer_to,
		transferred_at,
		transferItems,
	}, extras);

	const transfer = await TransferService.updateTransferStatus({
		transfer_id,
		status,
		branch_id,
		isServiceCall: true,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(transfer, { message: 'Transfer created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Transfer, req.query, {
		defaultMainOpAnd: [
			{
				[Op.or]: [
					{ transfer_from: branch_id },
					{ transfer_to: branch_id },
				]
			}
		],
	});

	const transfers = await Transfer.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Branch,
				as: 'transferFrom',
				paranoid: false,
			},
			{
				model: Branch,
				as: 'transferTo',
				paranoid: false,
			},
		],
		where: {
			...whereOption,

		},
	});

	return res.sendRes(transfers, {
		message: 'Transfers loaded successfully',
		total: await Transfer.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { transfer_id } = req.params;

	/** @type {TTransfer} */
	const transfer = await findModelOrThrow({ transfer_id }, Transfer, {
		include: [
			{
				model: Branch,
				as: 'transferFrom',
				paranoid: false,
			},
			{
				model: Branch,
				as: 'transferTo',
				paranoid: false,
			},
			{
				model: TransferItem,
				as: 'transferItems',
				include: [
					{
						model: Batch,
						as: 'batch',
						paranoid: false,
						include: [
							{
								model: Item,
								as: 'item',
								paranoid: false,
								include: [
									{
										model: Batch,
										as: 'batches',
									},
								],
							},
						],
					},
					{
						model: Batch,
						as: 'transferredAs',
						paranoid: false,
						include: [
							{
								model: Item,
								as: 'item',
								paranoid: false,
								include: [
									{
										model: Batch,
										as: 'batches',
									},
								],
							},
						],
					},
				],
			},
		],
	});

	transfer.transferItems.forEach(tItem => {
		tItem.batch.item.dataValues.quantity = tItem.batch.item.batches.reduce((acc, batch) => acc + batch.quantity, 0);
	});

	return res.sendRes(transfer, { message: 'Transfer loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { transfer_id } = req.params;
	const { branch_id } = req.branch;
	const { transfer_from, transfer_to, transferred_at, transferItems } = req.body;

	const transfer = await TransferService.updateTransfer({
		transfer_id,
		branch_id,
		transfer_from,
		transfer_to,
		transferred_at,
		transferItems
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(transfer, { message: 'Transfer updated successfully', status: STATUS_CODE.OK });
});

const updateStatus = routeHandler(async (req, res, extras) => {
	const { transfer_id, status } = req.params;
	const { branch_id } = req.branch;

	const transfer = await TransferService.updateTransferStatus({
		transfer_id,
		status,
		branch_id,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(transfer, { message: 'Transfer status updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { transfer_id } = req.params;
	const { branch_id } = req.branch;

	await TransferService.deleteTransfer({ transfer_id, branch_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Transfer deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	updateStatus,
	deleteById,
};