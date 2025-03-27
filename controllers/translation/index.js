const { Translation } = require("../../models");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { validateNullParameters, findModelOrThrow, validateTrue, findModelAndThrow } = require("../../utils/validation");
const { Op } = require("sequelize");
const { LANGUAGES } = require("../../data/constants");

const update = routeHandler(async (req, res, extras) => {
	let { language, key, value } = req.body;
	const { user_id } = req.auth;

	validateNullParameters([language, key, value]);
	language = language.toUpperCase();
	key = key.toUpperCase();

	validateTrue(Object.keys(LANGUAGES).includes(language));

	const [translation, isCreated] = await Translation.upsert({
		language,
		key,
		value,
		created_by: user_id,
	}, {
		transaction: extras.transaction,
		conflictFields: ['key', 'language'],
	});

	await extras.transaction.commit();
	return res.sendRes(translation, { message: 'Translation saved successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
	const { q, language } = req.query;

	const filter = {};
	if (q && q != "") {
		filter['key'] = {
			[Op.like]: `%${q}%`,
		}
	}
	if (language && language != "" && Object.keys(LANGUAGES).includes(language)) {
		filter['language'] = language;
	}

	const translations = await Translation.findAll({
		...req.paginate,
		where: filter,
	});

	return res.sendRes(translations, {
		message: 'Translations loaded successfully',
		...req.meta,
		total: await Translation.count(),
		status: STATUS_CODE.OK,
	});
}, false);

const getAllData = routeHandler(async (req, res, extras) => {
	const { q, language } = req.query;

	const filter = {};
	if (q && q != "") {
		filter['key'] = {
			[Op.like]: `%${q}%`,
		}
	}
	if (language && language != "" && Object.keys(LANGUAGES).includes(language)) {
		filter['language'] = language;
	}

	const translations = await Translation.findAll({
		...req.paginate,
		where: filter,
	});

	const data = {};
	Object.keys(LANGUAGES).forEach(key => {
		data[key] = {};
	})

	translations.forEach(translation => {
		const { language, key, value } = translation;
		data[language][key] = value;
	});

	return res.sendRes(data, {
		message: 'Translations loaded successfully',
		...req.meta,
		total: await Translation.count(),
		status: STATUS_CODE.OK,
	});
}, false);

const updateById = routeHandler(async (req, res, extras) => {
	const { translation_id } = req.params;
	let { language, key, value } = req.body;
	const { user_id } = req.auth;

	validateNullParameters([language, key, value]);
	language = language.toUpperCase();
	key = key.toUpperCase();

	validateTrue(Object.keys(LANGUAGES).includes(language));

	const findTranslation = await findModelOrThrow({ translation_id }, Translation, {
	}, {
		throwOnDeleted: true,
		messageOnDeleted: "Translation is deleted",
		messageOnNotFound: "Translation not found",
	});

	await findModelAndThrow({
		language,
		key,
		translation_id: {
			[Op.not]: translation_id,
		},
	}, Translation, { paranoid: true }, {
		messageOnFound: "Another Translation exist with this title",
	});

	await findTranslation.update({
		language,
		key,
		value,
		updated_by: user_id,
	}, { transaction: extras.transaction });

	await findTranslation.reload({ transaction: extras.transaction });

	await extras.transaction.commit();
	return res.sendRes(findTranslation, { message: 'Translation updated successfully', status: STATUS_CODE.OK });
});

const deleteById = routeHandler(async (req, res, extras) => {
	const { translation_id } = req.params;
	const { user_id } = req.auth;

	const translation = await findModelOrThrow({ translation_id }, Translation, {}, {
		throwOnDeleted: true,
		messageOnDeleted: "Translation is already deleted",
		messageOnNotFound: "Translation not found",
	});

	await translation.update({
		deleted_by: user_id,
	}, { transaction: extras.transaction });

	await translation.destroy({ transaction: extras.transaction });
	await extras.transaction.commit();
	return res.sendRes(null, { message: 'Translation deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
	update,
	getAll,
	getAllData,
	updateById,
	deleteById,
};