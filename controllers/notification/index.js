const { NO_PARAMS } = require("../../utils/errorMessage");
const { STATUS_CODE } = require("../../utils/utility");
const routeHandler = require("../../utils/routeHandler");
const { isNull, findModelOrThrow } = require("../../utils/validation");
const { sendAppError } = require("../../utils/appError");
const { Notification, Customer, Device, Asset, Interest, Medal, Discount, Event } = require("../../models");
const { Op } = require("sequelize");
const { notifySNSU } = require("../../services/notification");
// const { getTemplateByName } = require("../../services/template");
const { renderTextWithVariable } = require("../../helper/common");
const { LANGUAGES } = require("../../data/constants");

const testCreate = routeHandler(async (req, res, extras) => {
    const user = req.auth;
    // const testNotificationTemplate = await getTemplateByName("NOTIFICATION", "TEST_NOTIFICATION");

    Object.keys(LANGUAGES).forEach((language) => {
        const { title, description } = testNotificationTemplate[language];
        testNotificationTemplate[language].title = renderTextWithVariable(title, {
            USERNAME: user.username,
        });
    });

    testNotificationTemplate.data = { user };

    await notifySNSU(testNotificationTemplate, user, extras);
    await extras.transaction.commit();

    return res.sendRes(null, { message: 'Notifications sent successfully', status: STATUS_CODE.OK });
});

const getAll = routeHandler(async (req, res, extras) => {
    const { user_id } = req.auth;
    const notifications = await Notification.findAll({
        where: { user_id },
        // send deleted
    });

    return res.sendRes(notifications, { message: 'Notifications loaded successfully', status: STATUS_CODE.OK });
}, false);

const getById = routeHandler(async (req, res, extras) => {
    const { notification_id } = req.params;
    const notification = await Notification.findOne({ where: { notification_id } });

    if (!notification) {
        return sendAppError(extras, 'Notification not found', STATUS_CODE.NOT_FOUND);
    }
    return res.sendRes(notification, { message: 'Notification loaded successfully', status: STATUS_CODE.OK });
}, false);

const deleteById = routeHandler(async (req, res, extras) => {
    const { notification_id } = req.params;

    const notification = await Notification.findOne({ where: { notification_id } });
    if (!notification) {
        return sendAppError(extras, 'Notification not found', STATUS_CODE.NOT_FOUND);
    }

    await notification.destroy({ transaction: extras.transaction });

    await extras.transaction.commit();
    return res.sendRes(null, { message: 'Notification deleted successfully', status: STATUS_CODE.OK });
});

module.exports = {
    testCreate,
    getAll,
    getById,
    deleteById,
};
