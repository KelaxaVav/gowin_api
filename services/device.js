const { Op } = require("sequelize");
const { Device } = require("../models");

module.exports.registerDeviceToken = async ({ user_id, platform, fcm_token }, extras) => {
    let findDevice = await Device.findOne({ where: { fcm_token } });
    if (findDevice) {
        await findDevice.update({ user_id, platform, fcm_token }, { transaction: extras.transaction });
    }
    else {
        findDevice = await Device.create({ user_id, platform, fcm_token },
            { transaction: extras.transaction, });
    }

    return findDevice;
}