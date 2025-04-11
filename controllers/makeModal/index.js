const { MakeModal, Make, Modal } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const MakeModalService = require("../../services/makeModal");

const create = routeHandler(async (req, res, extras) => {
	const { make_id,name, is_active } = req.body;

	const makeModal = await MakeModalService.createMakeModal({
		make_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(makeModal, { message: 'Make Modal created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const makeModal = await MakeModal.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Make,
				as: 'make',
			},
			{
				model: Modal,
				as: 'modal',
			}
		]
	});

	return res.sendRes(makeModal, {
		message: 'Make Modal loaded successfully',
		total: await MakeModal.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { make_modal_id } = req.params;

	// /** @type {TTransfer} */
	const makeModal = await findModelOrThrow({ make_modal_id }, MakeModal,{
		include: [
			{
				model: Make,
				as: 'make',
			},
			{
				model: Modal,
				as: 'modal',
			}
		]
	});


	return res.sendRes(makeModal, { message: 'Make Modal loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { make_modal_id } = req.params;
	const { make_id, name, is_active } = req.body;

	const makeModal = await MakeModalService.updateMakeModal({
		make_modal_id,
		make_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(makeModal, { message: 'Make Modal updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { make_modal_id } = req.params;

	await MakeModalService.deleteMakeModal({ make_modal_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Make Modal deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};