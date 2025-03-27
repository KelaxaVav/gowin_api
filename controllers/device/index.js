const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { sendAppError } = require("../../utils/appError");
const { Device } = require("../../models");
const { registerDeviceToken } = require("../../services/device");
const { whereSearchAndFilter } = require("../../helper/common");
const { validateNullParameters } = require("../../utils/validation");

const create = routeHandler(async (req, res, extras) => {
    const {
        platform,
        fcm_token,
    } = req.body;
    const user_id = req.auth?.user_id ?? req.body.user_id;

    validateNullParameters([platform, fcm_token]);
    const device = await registerDeviceToken({ user_id, platform, fcm_token }, extras);

    await extras.transaction.commit();
    return res.sendRes(device, {
        message: 'Device saved successfully',
        status: STATUS_CODE.CREATED,
    });
});

const getAll = routeHandler(async (req, res, extras) => {
    const whereOption = whereSearchAndFilter(Category, req.query);

    const devices = await Device.findAll({
        order: [['created_at', 'DESC'],],
        ...req.paginate,
        where: whereOption,
    });
    return res.sendRes(devices, {
        message: "Devices loaded successfully",
        ...req.meta,
        total: await Device.count(),
        status: STATUS_CODE.OK,
    });
}, false);

const getById = routeHandler(async (req, res, extras) => {
    const { device_id } = req.params;
    const device = await Device.findOne({
        where: { device_id },
    });

    if (!device) {
        return sendAppError(extras, 'Device not found', STATUS_CODE.NOT_FOUND);
    }
    return res.sendRes(device, { message: 'Device loaded successfully', status: STATUS_CODE.OK });
}, false);

const deleteById = routeHandler(async (req, res, extras) => {
    const { device_id } = req.params;
    const { user_id } = req.auth;

    const device = await Device.findOne({ where: { device_id } });
    if (!device) {
        return sendAppError(extras, 'Device not found', STATUS_CODE.NOT_FOUND);
    }

    await device.destroy({ transaction: extras.transaction });

    await extras.transaction.commit();
    return res.sendRes(null, { message: 'Device deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
    create,
    getAll,
    getById,
    deleteById,
};
