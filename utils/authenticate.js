const AppError = require("./appError");
const { STATUS_CODE } = require("./utility");
const { UNAUTHENTICATED } = require("./errorMessage");

/**
 * Validate authention of api requests
 * @param  {...any} exceptions 
 * @returns {(req:import("express").Request,res:import("express").Response,next:import("express").NextFunction)=>void}
 */
module.exports = function authenticate(...exceptions) {
    return function (req, res, next) {
        const auth = req.auth;
        if (auth) {
            return next();
        }

        if (exceptions.includes(req.path)) {
            return next();
        }
        return next(new AppError(UNAUTHENTICATED, STATUS_CODE.UNAUTHORIZED));
    }
};