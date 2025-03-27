const { sendAppError } = require("../../utils/appError");
const { User, Role } = require("../../models");
const routeHandler = require("../../utils/routeHandler");
const { STATUS_CODE } = require("../../utils/utility");
const { findModelOrThrow, Validation } = require("../../utils/validation");
const bcrypt = require('bcrypt');
const { createJWTToken } = require("../../utils/jwtAuth");

const login = routeHandler(async (req, res, extras) => {
    const {
        nic,
        password,
    } = req.body;

    Validation.nullParameters([nic, password]);

    const user = await findModelOrThrow({ nic }, User, {
        include: [
            {
                model: Role,
                as: 'role',
            }
        ],
    });

    const { password_hash } = user.dataValues;

    if (!bcrypt.compareSync(password, password_hash)) {
        return sendAppError(extras, "Login Failed", STATUS_CODE.BAD_REQUEST);
    }

    const token = createJWTToken({ user_id: user.user_id });
    return res.sendRes({ user, token }, { message: 'Login success', status: STATUS_CODE.OK });
}, false);

module.exports = {
    login,
};
