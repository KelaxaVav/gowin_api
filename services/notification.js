const { Op } = require("sequelize");
const firebase = require("../firebase");
const { Notification, Device, User } = require("../models");
const { v4 } = require("uuid")

/**
 * Send static notification to single user
 * @param {*} notificationData 
 * @param {*} user 
 * @param {*} extras 
 * @param {*} options 
 * @returns 
 */
module.exports.notifySNSU = async (notificationData, user, extras, options = { deleteInvalid: true }) => {
    const deleteInvalid = options.deleteInvalid ?? true;

    let success = 0;
    let failed = 0;
    const failedDevices = [];

    let devices = user.devices;
    if (!devices) {
        devices = await user.getDevices();
    }
    const fcmTokens = devices.map(device => device.fcm_token);
    const translation = notificationData[user.settings.language];
    const { title, subtitle, description, type } = translation;

    const app_notification = await Notification.create({
        title,
        subtitle,
        description,
        type,
        pills: notificationData.pills ?? [],
        data: notificationData.data,
        user_id: user.user_id,
    }, { transaction: extras.transaction });

    const messageData = {
        data: {
            notification_id: app_notification.notification_id,
        },
        notification: {
            title: title,
            body: description,
            // image: notificationData.data.imageUrl,
        },
        tokens: fcmTokens,
    };

    let data;
    if (fcmTokens.length) {
        data = await firebase.messaging().sendEachForMulticast(messageData)
    }
    delete messageData.tokens;

    data?.responses?.forEach((response, index) => {
        if (response.success) {
            success++;
        } else {
            failedDevices.push(devices[index]);
            failed++;
        }
    });

    failedDevices.length && deleteInvalid && await Device.destroy({
        where: {
            device_id: {
                [Op.in]: failedDevices.map(device => device.device_id),
            }
        },
        transaction: extras?.transaction,
    });

    return { success, failed, app_notification, failedDevices };
}

/**
 * Send static notification to multiple users
 * @param {*} notificationData 
 * @param {*} users 
 * @param {*} extras 
 * @returns 
 */
module.exports.notifySNMU = async (notificationData, users, extras) => {
    let success = 0;
    let failed = 0;
    const failedDevices = [];
    const app_notifications = [];
    const push_notifications = [];

    for (let index = 0; index < users.length; index++) {
        const user = users[index];
        const { title, subtitle, description, type } = notificationData[user.settings.language];

        const notification_id = v4();
        app_notifications.push({
            notification_id,
            title,
            subtitle,
            description,
            type,
            pills: notificationData.pills ?? [],
            data: notificationData.data ?? {},
            user_id: user.user_id,
        });

        user.devices.forEach(device => {
            push_notifications.push({
                data: {
                    notification_id,
                },
                notification: {
                    title: title,
                    body: description,
                },
                token: device.fcm_token,
            });
        });
    }

    const notifications = await Notification.bulkCreate(app_notifications, {
        transaction: extras.transaction,
    });

    let data;
    if (push_notifications.length) {
        data = await firebase.messaging().sendEach(push_notifications);
        console.log(`data`, data);
    }

    // data?.responses?.forEach((response, index) => {
    //     if (response.success) {
    //         success++;
    //     } else {
    //         failedDevices.push(devices[index]);
    //         failed++;
    //     }
    // });

    // failedDevices.length && deleteInvalid && await Device.destroy({
    //     where: {
    //         device_id: {
    //             [Op.in]: failedDevices.map(device => device.device_id),
    //         }
    //     },
    //     transaction: extras?.transaction,
    // });

    return { success, failed };
}

module.exports.notifyBulkTranslationToken = async (translations, users, extras, options = { saveNotification: true, deleteInvalid: true }) => {
    const saveNotification = options.saveNotification ?? true;
    const deleteInvalid = options.deleteInvalid ?? true;

    const push_notifications = [];
    const app_notifications = [];
    const devices = [];
    const failedDevices = [];
    const usersWithoutDevice = [];
    let success = 0;
    let failed = 0;

    users.forEach(user => {
        if (user.dataValues.devices) {
            const userDevices = user.dataValues.devices;
            devices.push(...userDevices);
        }
        else {
            usersWithoutDevice.push(user);
        }
        app_notifications.push({
            data: translations,
            type: 'APP_NOTIFICATION',
            is_read: false,
            status: 'SUCCESS',
            user_id: user.user_id,
        });
    });

    for (let index = 0; index < translations.length; index++) {
        const translation = translations[index];
        const { language, title, subtitle, body, imageUrl } = translation;
        const languageDevices = devices.filter(device => device.language == language);
        const languageTokens = languageDevices.map(device => device.fcm_token);

        if (!languageTokens.length) {
            continue;
        }

        const messageData = {
            data: {
                message: title,
            },
            notification: {
                title,
                body,
                image: imageUrl,
            },
            tokens: languageTokens,
        };

        const data = await firebase.messaging().sendEachForMulticast(messageData)
        delete messageData.tokens;

        data.responses?.forEach((response, index) => {
            if (response.success) {
                success++;
            } else {
                failedDevices.push(languageDevices[index]);
                failed++;
            }

            push_notifications.push({
                type: 'PUSH_NOTIFICATION',
                response,
                data: messageData,
                status: response.success ? 'SUCCESS' : 'FAILED',
                device_id: languageDevices[index].device_id,
            });
        });
    }

    let notificationDatas = [];
    const notifications = [...push_notifications, ...app_notifications];
    if (saveNotification && notifications.length) {
        notificationDatas = await Notification.bulkCreate(notifications, { transaction: extras?.transaction });
    }

    failedDevices.length && deleteInvalid && await Device.destroy({
        where: {
            device_id: {
                [Op.in]: failedDevices.map(device => device.device_id),
            }
        },
        transaction: extras?.transaction,
    });

    return { success, failed, notificationDatas, failedDevices };
}

/**
 * Send dynamic notifications to multiple users
 * @param {*} users 
 * @param {*} extras 
 * @param {*} options 
 * @returns 
 */
module.exports.notifyDNMU = async (users, transaction, options = { deleteInvalid: true }) => {
    const deleteInvalid = options.deleteInvalid ?? true;

    let success = 0;
    let failed = 0;
    const failedDevices = [];

    const app_notifications = [];
    const push_notifications = [];

    for (let index = 0; index < users.length; index++) {
        const user = users[index];
        const { title, subtitle, description, type } = user.notificationData[user.settings.language];

        const notification_id = v4();
        app_notifications.push({
            notification_id,
            title,
            subtitle,
            description,
            type,
            pills: user.notificationData.pills ?? [],
            data: user.notificationData.data,
            user_id: user.user_id,
        });

        user.devices.forEach(device => {
            push_notifications.push({
                data: {
                    notification_id,
                },
                notification: {
                    title: title,
                    body: description,
                },
                token: device.fcm_token,
            });
        });
    }

    const notifications = await Notification.bulkCreate(app_notifications, { transaction });

    let data;
    if (push_notifications.length) {
        data = await firebase.messaging().sendEach(push_notifications);
        console.log(`data`, data);
    }

    // data?.responses?.forEach((response, index) => {
    //     if (response.success) {
    //         success++;
    //     } else {
    //         failedDevices.push(devices[index]);
    //         failed++;
    //     }
    // });

    // failedDevices.length && deleteInvalid && await Device.destroy({
    //     where: {
    //         device_id: {
    //             [Op.in]: failedDevices.map(device => device.device_id),
    //         }
    //     },
    //     transaction: extras?.transaction,
    // });

    return { success, failed };
}