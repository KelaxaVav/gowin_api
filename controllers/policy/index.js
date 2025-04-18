const { Policy, Insurer, MakeModal, Product, LoginId, Partner, RTO } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const PolicyService = require("../../services/policy");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const {
		policy_no,
		age,
		chassis_no,
		yom,
		cpa,
		gvw,
		cc,
		seating,
		kw,
		odp,
		net_premium,
		issued_date,
		tp_start_date,
		od_start_date,
		insured_name,
		mobile_no,
		email_id,
		reg_no,
		tpp,
		gross_premium,
		reg_date,
		tp_expiry_date,
		od_expiry_date,
		make_id,
		make_modal_id,
		rto_id,
		product_id,
		partner_id,
		loginId_id,
		is_active,
	} = req.body;

	const policy = await PolicyService.createModal({
		policy_no,
		age,
		chassis_no,
		yom,
		cpa,
		gvw,
		cc,
		seating,
		kw,
		odp,
		net_premium,
		issued_date: issued_date ? new Date(issued_date) : null,
		tp_start_date: tp_start_date ? new Date(tp_start_date) : null,
		od_start_date: od_start_date ? new Date(od_start_date) : null,
		insured_name,
		mobile_no,
		email_id,
		reg_no,
		tpp,
		gross_premium,
		reg_date: reg_date ? new Date(reg_date) : null,
		tp_expiry_date: tp_expiry_date ? new Date(tp_expiry_date) : null,
		od_expiry_date: od_expiry_date ? new Date(od_expiry_date) : null,
		make_id,
		make_modal_id,
		rto_id,
		product_id,
		partner_id,
		loginId_id,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(policy, { message: 'Policy created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Policy, req.query);

	const policies = await Policy.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: MakeModal,
				as: 'makeModal',
			},
			{
				model: Product,
				as: 'product',
				include: [
					{
						model: Insurer,
						as: 'insurer',
					},
				]
			},
			{
				model: LoginId,
				as: 'loginId',
			},
			{
				model: Partner,
				as: 'partner',
			},
			{
				model: RTO,
				as: 'rto',
			},
		],
		where: whereOption,
	});

	return res.sendRes(policies, {
		message: 'Policies loaded successfully',
		total: await Policy.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { policy_id } = req.params;

	// /** @type {TTransfer} */
	const policy = await findModelOrThrow({ policy_id }, Policy, {
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


	return res.sendRes(policy, { message: 'Policy loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { policy_id } = req.params;
	const { make_modal_id, insurer_id, name, is_active } = req.body;

	const policy = await PolicyService.updateModal({
		policy_id,
		insurer_id,
		make_modal_id,
		name,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(policy, { message: 'Policy updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { policy_id } = req.params;

	await PolicyService.deleteModal({ policy_id }, extras);

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