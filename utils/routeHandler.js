const { Transaction } = require("sequelize");
const { sequelize, User } = require("../models");

/**
 * Handle errors and transaction management
 * @param {(req: import("express").Request, res: import("express").Response, extras: {next:import("express").NextFunction,transaction:Transaction}) => Promise<void>} apiController yguyg
 * @param {res} res ggjhgjg
 * @returns kgh
 */
module.exports = (apiController, useTransaction = true) => {
    return async (req, res, next) => {
        let transaction;
        if (useTransaction) {
            transaction = await sequelize.transaction({ logging: console.log });
        }

        try {
            const system = await User.findOne({
                where: {
                    email: 'system@api.com',
                },
            });
            req.system = system;

            await apiController(req, res, {
                next,
                transaction,
                user_id: req.auth?.user_id,
                system_id: req.system?.user_id,
            });
            if (useTransaction && !transaction.finished) {
                await transaction.rollback();
            }
        } catch (error) {
            console.log(error);
            if (useTransaction && !transaction.finished) {
                await transaction.rollback().finally(() => next(error));
            }
            else {
                next(error);
            }
        }

        if (!req.path.includes('webhook')) {
            console.log(`Request => method : ${req.method}, path : ${req.path}, auth : ${req.auth?.username ?? 'No Auth'}`);
        }
    }
}