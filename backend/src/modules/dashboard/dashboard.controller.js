const dashboardService = require('./dashboard.service');

const getStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getStats();
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};

module.exports = { getStats };
