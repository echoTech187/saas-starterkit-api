const where = (req, separator) => {
    const filter = {};
    if (req.params) {
        for (const key in req.params) {
            filter[key] = req.params[key];
        }
    }
    if (req.body) {
        for (const key in req.body) {
            filter[key] = req.body[key];
        }
    }
    if (req.query) {
        for (const key in req.query) {
            if (key !== 'page' && key !== 'limit') {
                filter[key] = req.query[key];
            }else {
                delete filter[key];
            }
        }
    }
    const filterKeys = Object.keys(filter);
    let query = '';
    let values = [];

    if (filterKeys.length > 0) {
        const whereConditions = filterKeys.map(key => `${key} = ?`).join(' ' + (separator || 'AND') + ' ');
        query += ` WHERE ${whereConditions}`;
        values = filterKeys.map(key => filter[key]);
    }
    return { queryResult: query, fields: filterKeys, values: values };
};

const whereIn = (req, fieldName) => {
    const filter = {};
    if (req.body) {
        for (const key in req.body) {
            filter[key] = req.body[key];
        }
    }
    if (req.query) {
        for (const key in req.query) {
            filter[key] = req.query[key];
        }
    }
    if (req.params) {
        for (const key in req.params) {
            filter[key] = req.params[key];
        }
    }
    const filterKeys = Object.keys(filter);
    let query = '';
    let values = [];
    if (filterKeys.length > 0) {
        const whereConditions = filterKeys.map(key => `${fieldName} = ?`).join(' OR ');
        query += ` WHERE ${whereConditions}`;
        values = filterKeys.map(key => filter[key]);
    }
    return { queryResult: query, fields: filterKeys, values: values };
};

module.exports = { where, whereIn };