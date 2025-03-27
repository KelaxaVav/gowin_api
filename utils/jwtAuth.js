const jwt = require("jsonwebtoken");
const { User, Role, Branch } = require("../models");
const AppError = require("./appError");
const { STATUS_CODE } = require("./utility");
const { JWT_SECRET } = process.env;

const verifyAuthHeader = (authorization) => {
    if (!authorization?.startsWith('Bearer ')) {
        return;
    }

    const token = authorization?.split(' ').pop();
    if (!token) {
        return;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
}

module.exports = async function jwtAuth(req, res, next) {
    try {
        const payload = verifyAuthHeader(req.headers.authorization);
        if (payload) {
            const user = await User.findOne({
                include: [
                    {
                        model: Role,
                        as: 'role',
                        required: true,
                        include: [
                            {
                                model: Branch,
                                as: 'branch',
                                required: true,
                            },
                        ],
                    },
                ],
                where: {
                    user_id: payload.user_id,
                },
            });

            if (!user) {
                throw new AppError("Invalid token", STATUS_CODE.UNAUTHORIZED);
            }

            req.auth = user;
            req.role = user.role;
            req.branch = user.role.branch;
        }
        next();
    } catch (error) {
        console.error(error);

        if (!error.isAppError) {
            return next(new AppError(error.name, STATUS_CODE.UNAUTHORIZED));
        }
        next(error);
    }
};

/**
 * 
 * @param {Payload} payload 
 * @param {string | number | undefined} expiresIn 
 * @returns 
 */
module.exports.createJWTToken = (payload, expiresIn = "2d") => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}