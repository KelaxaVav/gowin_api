const { Vendor, Branch } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { whereSearchAndFilter } = require("../../helper/common");
const VendorService = require("../../services/vendor");

const create = routeHandler(async (req, res, extras) => {
	const { name, mobile } = req.body;
	const { branch_id } = req.branch;

	const vendor = await VendorService.createVendor({
		name,
		mobile,
		branch_id,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(vendor, { message: 'Vendor created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { branch_id } = req.branch;
	const whereOption = whereSearchAndFilter(Vendor, req.query, { defaultFilterObject: { branch_id } });

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

	const vendor = await findModelOrThrow({ vendor_id }, Vendor, {
		include: [
			{
				model: Branch,
				as: 'branch',
			},
		],
	});

	return res.sendRes(vendor, { message: 'Vendor loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { vendor_id } = req.params;
	const { name, mobile, status } = req.body;
	const { branch_id } = req.branch;

	const vendor = await VendorService.updateVendor({
		vendor_id,
		branch_id,
		name,
		mobile,
		status,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(vendor, { message: 'Vendor updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { vendor_id } = req.params;
	const { branch_id } = req.branch;

	await VendorService.deleteVendor({ vendor_id, branch_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Vendor deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById,
};