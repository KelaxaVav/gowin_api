const { Transfer, Type } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const TypesService = require("../../services/types");

const create = routeHandler(async (req, res, extras) => {
	const { name, is_active, type } = req.body;

	const types = await TypesService.createType({
		name,
		is_active,
		type
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(types, { message: 'Type created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { type } = req.params;

	const types = await Type.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: {
			type: type
		}
	});

	return res.sendRes(types, {
		message: 'Types loaded successfully',
		total: await Transfer.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { type_id } = req.params;

	// /** @type {TTransfer} */
	const types = await findModelOrThrow({ type_id }, Type);


	return res.sendRes(types, { message: 'Types loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { type_id } = req.params;
	const { name, is_active, type } = req.body;

	const types = await TypesService.updateTypes({
		type_id,
		name,
		is_active,
		type,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(types, { message: 'Type updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { type_id } = req.params;

	await TypesService.deleteType({ type_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Type deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};