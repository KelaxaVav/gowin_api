const { Partner, State, City, PinCode, Staff, Team } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { findModelOrThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const PartnerService = require("../../services/partner");

const create = routeHandler(async (req, res, extras) => {
	const { name, branch_id, city_id, confirm_password, door_no, email, mobile_no,
		partner_type_id, password, pin_code, staff_id, street, is_active } = req.body;

	const partners = await PartnerService.createPartner({
		name,
		branch_id,
		city_id,
		confirm_password,
		door_no,
		email,
		mobile_no,
		partner_type_id,
		password,
		pin_code,
		staff_id,
		street,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(partners, { message: 'Partner created successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const partners = await Partner.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: Staff,
				as: 'staff',
			},
			{
				model: City,
				as: 'city',
			},
		],
	});

	return res.sendRes(partners, {
		message: 'Partner loaded successfully',
		total: await Partner.count(),
	});
}, false);

const getById = routeHandler(async (req, res, extras) => {
	const { partner_id } = req.params;

	const team = await findModelOrThrow({ partner_id }, Partner, {
		include: [
			{
				model: Staff,
				as: 'staff',
				include: [
					{
						model: Team,
						as: 'team',
					}
				],
			}
		],
	});

	return res.sendRes(team, { message: 'Partner loaded successfully', status: STATUS_CODE.OK });
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { partner_id } = req.params;
	const { name, branch_id, city_id, confirm_password, door_no, email, mobile_no,
		partner_type_id, password, pin_code, staff_id, street, is_active } = req.body;

	const partners = await PartnerService.updatePartner({
		partner_id,
		name,
		branch_id,
		city_id,
		confirm_password,
		door_no,
		email,
		mobile_no,
		partner_type_id,
		password,
		pin_code,
		staff_id,
		street,
		is_active,
	}, extras);

	await extras.transaction.commit();
	return res.sendRes(partners, { message: 'Partner updated successfully', status: STATUS_CODE.OK });
});


const deleteById = routeHandler(async (req, res, extras) => {
	const { partner_id } = req.params;

	await PartnerService.deletePartner({ partner_id }, extras);

	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Partner deleted successfully', status: STATUS_CODE.OK });
});

const getCreatePartnerTypeData = routeHandler(async (req, res, extras) => {
	const state = await State.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
		include: [
			{
				model: City,
				as: 'cities',
			}
		]
	});

	const pinCodes = await PinCode.findAll({
		...req.paginate,
		order: [['created_at', 'DESC']],
	});

	const partnerData = {
		state: state,
		pin_codes: pinCodes
	}

	return res.sendRes(partnerData, {
		message: 'Partner Data loaded successfully',
		// total: await Partner.count(),
	});
}, false);

module.exports = {
	create,
	getAll,
	getById,
	updateById,
	deleteById,
	getCreatePartnerTypeData
};