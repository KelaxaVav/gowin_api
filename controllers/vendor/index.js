const { Vendor } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const VendorService = require("../../services/vendor");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { name, is_active } = req.body;

	const vendor = await VendorService.createVendor({ name, is_active }, { transaction: extras.transaction });
	await extras.transaction.commit();
	return res.sendRes(vendor, { message: 'Vendor created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Vendor, req.query);

	const vendors = await Vendor.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(vendors, {
		message: 'Vendors loaded successfully',
		total: await Vendor.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { vendor_id } = req.params;

	const vendor = await findModelOrThrow({ vendor_id }, Vendor);

	return res.sendRes(vendor, { message: 'Vendor loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { vendor_id } = req.params;
	const { name, is_active } = req.body;

	const state = await VendorService.updateVendor({
		vendor_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(state, { message: 'Vendor updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { vendor_id } = req.params;

	await VendorService.deleteVendor({ vendor_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Vendor deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};