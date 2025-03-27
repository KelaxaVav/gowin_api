const { DISCOUNT_TYPES } = require("../data/constants");
const { Validation } = require("../utils/validation");

class CommonService {
    static validateDiscount(discount_type, discount_value) {
        Validation.emptyStringParameters([discount_type]);

        if (discount_type) {
            Validation.isTrue(Object.keys(DISCOUNT_TYPES).includes(discount_type), {
                message: "Invalid discount type",
            });
            Validation.isTrue(discount_value > 0, {
                message: "Invalid discount value",
            });
        }
    }
}

module.exports = CommonService;