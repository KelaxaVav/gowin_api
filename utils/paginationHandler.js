module.exports = async (req, res, next) => {
    let offset;
    let limit;
    let size;
    let page;
    let oldPage;

    size = parseInt(req.query?.size);
    oldPage = parseInt(req.query?.page);

    delete req.query.size;
    delete req.query.page;

    if (isNaN(size) && !isNaN(oldPage)) {
        size = 10;
    }

    if (!size && !oldPage) {
        req.meta = {};
        req.paginate = {};
        return next();
    }

    if (isNaN(oldPage)) {
        oldPage = 1;
    }

    if ((oldPage - 1) < 0) {
        page = 0;
    } else {
        page = oldPage - 1;
    }

    offset = page * size;
    limit = size;

    req.meta = {
        page: oldPage,
        size,
    };
    req.paginate = {
        offset,
        limit,
    };
    next();
}