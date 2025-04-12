const { Modal, Make, MakeModal } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const ModalService = require("../../services/modal");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { make_id, make_modal_id, modal_name, gvw, cc, seater, kw, is_active } = req.body;

	const modal = await ModalService.createModal({
		make_id,
		make_modal_id,
		modal_name,
		gvw,
		cc,
		seater,
		kw,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(modal, { message: 'Modal created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Modal, req.query);

	const modals = await Modal.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Make,
				as: 'make',
			},
			{
				model: MakeModal,
				as: 'make_modal',
			}
		],
		where: whereOption,
	});

	return res.sendRes(modals, {
		message: 'Modal loaded successfully',
		total: await Modal.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { modal_id } = req.params;

	// /** @type {TTransfer} */
	const modal = await findModelOrThrow({ modal_id }, Modal, {
		include: [
			{
				model: Make,
				as: 'make',
			},
			{
				model: MakeModal,
				as: 'make_modal',
			}
		]
	});


	return res.sendRes(modal, { message: 'Modal loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { modal_id } = req.params;
	const { make_id, make_modal_id, modal_name, gvw, cc, seater, kw, is_active } = req.body;

	const modal = await ModalService.updateModal({
		modal_id,
		make_modal_id,
		make_id,
		modal_name,
		gvw,
		cc,
		seater,
		kw,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(modal, { message: 'Modal updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { modal_id } = req.params;

	await ModalService.deleteModal({ modal_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Modal deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};