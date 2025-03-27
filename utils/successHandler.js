const { EventLog } = require("../models");

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
module.exports = (req, res, next) => {
    res.sendRes = (data, meta) => {
        const length = data && Array.isArray(data) && data.length || undefined;
        res.status(meta.status || 200).send({
            status: true,
            length,
            meta: { ...req.meta, ...meta },
            data,
        });
        // next();
    }
    next();
}