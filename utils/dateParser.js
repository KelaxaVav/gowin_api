function parseDate(dateString) {
    return new Date(dateString);
}

function recursiveDateParser(data) {
    if (!data) {
        return;
    }

    if (Array.isArray(data)) {
        data.forEach((value, index) => {
            if (typeof value == "string" && value.endsWith('Z')) {
                const date = parseDate(value);
                if (date && !isNaN(date)) {
                    data[index] = date;
                }
            }
            else if (typeof value == "object") {
                recursiveDateParser(value);
            }
        });
    }
    else {
        Object.keys(data).forEach((key) => {
            const value = data[key];
            if (typeof value == "string" && value.endsWith('Z')) {
                const date = parseDate(value);
                if (date && !isNaN(date)) {
                    data[key] = date;
                }
            }
            else if (typeof value == "object") {
                recursiveDateParser(value);
            }
        });
    }
}

module.exports = async (req, res, next) => {
    recursiveDateParser(req.body);
    next();
}