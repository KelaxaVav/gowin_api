const { EventLog } = require("../models");
const AppError = require("./appError");

const errorHandler = async (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    // await EventLog.create({
    //     user_id: req.auth?.user_id,
    //     data: {
    //         body: req.body,
    //         params: req.params,
    //         query: req.query,
    //     },
    //     endpoint: req.path,
    //     status: "FAILED",
    // });

    if (process.env.NODE_ENV === "production") {
        // productionError(res, error);
        developmentError(res, error);

    }
    else {
        developmentError(res, error);
    }
};

function productionError(res, error) {
    if (error.isAppError) {
        res.status(error.statusCode).json({
            status: false,
            meta: {
                message: error.message,
                ...error.data,
            },
        });
    }
    else {
        res.status(500).json({
            status: false,
            meta: {
                message: "Internal Server Error",
            },
        });
    }
}

function developmentError(res, error) {
    let err = error;
    if (error.name == 'SequelizeForeignKeyConstraintError') {
        err.message = `Incorrect foreignkey ${error.fields[0]}`;
        err.data = { fields: error.fields };
    }
    res.status(err.statusCode).json({
        status: false,
        meta: {
            message: err.message,
            ...err.data,
        },
        error: err,
        errorStack: err.stack,
    });
}

module.exports = errorHandler;