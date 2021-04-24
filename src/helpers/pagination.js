module.exports = async (Model, query, queryOptions) => {
  const { limit, page } = queryOptions;
  let { sort } = queryOptions;

  // Sort by ascending or descending order
  if (sort) {
    let order = 'ASC';

    if (sort.startsWith('-')) {
      order = 'DESC';
      sort = sort.substr(1);
    }

    // Filter by creation date if 'sort' is set to date
    if (sort === 'date') {
      query.order.push(['createdAt', order]);
    } else {
      query.order.push([sort, order]);
    }
  }

  query.limit = +limit;
  query.offset = +((page - 1) * limit);

  // Return count and Results
  const records = await Model.findAndCountAll(query);
  return records;
};
