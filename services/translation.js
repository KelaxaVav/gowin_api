const { LANGUAGES } = require("../data");
const { Translation } = require("../models");

const updateTranslation = async (data, extras) => {
    const keys = {};
    const translations = [];

    Object.keys(data).forEach(key => {
        const dataValue = data[key];
        const dataKey = dataValue.toUpperCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '_')
            .replace(/^-+|-+$/g, '');

        keys[key] = dataKey;

        Object.keys(LANGUAGES).forEach(language => {
            if (language == LANGUAGES.ENGLISH) {
                translations.push({
                    key: dataKey,
                    language: LANGUAGES.ENGLISH,
                    value: dataValue,
                });
            }
            else {
                translations.push({
                    key: dataKey,
                    language,
                    value: '',
                });
            }
        })

    });

    await Translation.bulkCreate(translations, {
        updateOnDuplicate: ['key',],
        transaction: extras.transaction
    });

    return keys;
};

module.exports = {
    updateTranslation,
}