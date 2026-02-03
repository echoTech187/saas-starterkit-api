const paginate = (req, data, totalCount) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    totalPages = Math.ceil(totalCount / limit) || 1;
    return {
        success: true,
        message: 'Members retrieved successfully',
        currentPage: page,
        offset: offset,
        totalPages: totalPages,
        pageSize: limit,
        totalCount: totalCount,
        data: data
    };
};

module.exports = paginate;