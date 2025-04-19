const { Claim } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const ClaimService = require("../../services/claim");
const { whereSearchAndFilter } = require("../../helper/common");

const create = routeHandler(async (req, res, extras) => {
	const { policy_id, intimate_by, accident_date, claim_intimation_date, surveyar_name,
		surveyar_mobile, claim_approval_date, claim_settled_date, document_submitted, bill_amount,
		liablity_amount, settle_net_amount, settle_gst_amount, settle_total_amount, status } = req.body;

	const claim = await ClaimService.createClaim({
		policy_id,
		intimate_by,
		accident_date,
		claim_intimation_date,
		surveyar_name,
		surveyar_mobile,
		claim_approval_date,
		claim_settled_date,
		document_submitted,
		bill_amount,
		liablity_amount,
		settle_net_amount,
		settle_gst_amount,
		settle_total_amount,
		status,
	}, { transaction: extras.transaction });

	await extras.transaction.commit();

	return res.sendRes(claim, { message: 'Claim created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const whereOption = whereSearchAndFilter(Claim, req.query);

	const claims = await Claim.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		where: whereOption,
	});

	return res.sendRes(claims, {
		message: 'Claims loaded successfully',
		total: await Claim.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { claim_id } = req.params;

	// /** @type {TTransfer} */
	const designation = await findModelOrThrow({ claim_id }, Claim);


	return res.sendRes(designation, { message: 'Claim loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { claim_id } = req.params;
	const { intimate_by, accident_date, claim_intimation_date, surveyar_name,
		surveyar_mobile, claim_approval_date, claim_settled_date, document_submitted, bill_amount,
		liablity_amount, settle_net_amount, settle_gst_amount, settle_total_amount, status } = req.body;

	const state = await ClaimService.updateClaim({
		claim_id,
		intimate_by,
		accident_date,
		claim_intimation_date,
		surveyar_name,
		surveyar_mobile,
		claim_approval_date,
		claim_settled_date,
		document_submitted,
		bill_amount,
		liablity_amount,
		settle_net_amount,
		settle_gst_amount,
		settle_total_amount,
		status,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(state, { message: 'Claim updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { claim_id } = req.params;

	await ClaimService.deleteClaim({ claim_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Claim deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById
};