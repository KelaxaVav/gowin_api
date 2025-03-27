const { User, Credential } = require("../models");
const crypto = require('crypto');

module.exports.createUniqueOTP = async () => {
    try {
        let isFound = false;
        let newOTP;
        do {
            let randomOtp = Math.floor(100000 + (Math.random() * 1000000)).toString();
            randomOtp = randomOtp.slice(0, 6);

            const credintial = await Credential.findOne({ where: { otp_code: randomOtp } });
            isFound = credintial != null;
            newOTP = randomOtp;
        } while (isFound);

        const otp_expiry_at = new Date();
        otp_expiry_at.setMinutes(otp_expiry_at.getMinutes() + 5);

        return { otp_code: newOTP.toString(), otp_expiry_at };
    } catch (error) {
        console.log(error);
    }
}

module.exports.createUniqueMailVerifyCode = async () => {
    try {
        let isFound = false;
        let code;
        do {
            let randomCode = crypto.randomBytes(64).toString('base64');

            const credintial = await Credential.findOne({ where: { otp_code: randomCode } });
            isFound = credintial != null;
            code = randomCode;
        } while (isFound);

        const otp_expiry_at = new Date();
        otp_expiry_at.setMinutes(otp_expiry_at.getMinutes() + 5);

        return { otp_code: code.toString(), otp_expiry_at };
    } catch (error) {
        console.log(error);
    }
}

module.exports.createUniqueCode = async () => {
    try {
        let isFound = false;
        let newCode;
        let startWithZero = false;
        do {
            let randomCode = Math.random().toString(36).slice(2);
            randomCode = randomCode.slice(0, 6);

            const user = await User.findOne({ where: { referral_code: randomCode } });
            isFound = user != null;
            startWithZero = randomCode.charAt(0) == 0;
            newCode = randomCode;
        } while (isFound || startWithZero);

        return newCode.toString();
    } catch (error) {
        console.log(error);
    }
}

/**
 * 
 * @param {typeof import("sequelize").Model} Model 
 * @returns 
 */
module.exports.createUniqueNo = async (Model, { prefix }, finder) => {
    try {
        const key = `${Model.name.toLowerCase()}_no`;

        let isFound = false;
        let newIdentifier;
        do {
            const last = await Model.findOne({
                where: finder,
                order: [[key, 'DESC']],
                paranoid: false,
            });

            let identifier;
            if (last) {
                const prevIdentifier = last[key].split(prefix).pop();
                const newIdentifier = parseInt(prevIdentifier) + 1;

                identifier = `${prefix}${newIdentifier.toString().padStart(5, '0')}`;
            }
            else {
                identifier = `${prefix}${'1'.padStart(5, '0')}`;
            }

            const entity = await Model.findOne({
                where: {
                    [key]: identifier,
                },
                paranoid: false,
            });

            isFound = !!entity;
            newIdentifier = identifier;
        } while (isFound);

        return newIdentifier.toString();
    } catch (error) {
        console.log(error);
        throw error;
    }
}