const { Product, Insurer, MakeModal } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const ProductService = require("../../services/product");

const create = routeHandler(async (req, res, extras) => {
	const { insurer_id,make_modal_id, name,is_active } = req.body;

	const product = await ProductService.createModal({
		insurer_id,
		make_modal_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(product, { message: 'Product created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const products = await Product.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Insurer,
				as: 'insurer',
			},
			{
				model: MakeModal,
				as: 'make_modal',
			}
		]
	});

	return res.sendRes(products, {
		message: 'Products loaded successfully',
		total: await Product.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { product_id } = req.params;

	// /** @type {TTransfer} */
	const product = await findModelOrThrow({ product_id }, Product,{
		include: [
			{
				model: Insurer,
				as: 'insurer',
			},
			{
				model: MakeModal,
				as: 'make_modal',
			}
		]
	});


	return res.sendRes(product, { message: 'Product loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { product_id } = req.params;
	const { make_modal_id,insurer_id,name, is_active } = req.body;

	const product = await ProductService.updateModal({
		product_id,
		insurer_id,
		make_modal_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(product, { message: 'Product updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { product_id } = req.params;

	await ProductService.deleteModal({ product_id }, extras);

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