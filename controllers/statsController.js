const User = require('../models/User');
const Log = require('../models/Log');

exports.usersByRole = async (req, res, next) => {
  try {
    const agg = [
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { role: '$_id', count: 1, _id: 0 } }
    ];
    const results = await User.aggregate(agg);
    res.json({ results });
  } catch (err) { next(err); }
};

exports.loginStats = async (req, res, next) => {
  try {
    const agg = [
      { $match: { actionType: { $in: ['login-success', 'login-failed'] } } },
      { $group: { _id: '$actionType', count: { $sum: 1 } } },
      { $project: { actionType: '$_id', count: 1, _id: 0 } }
    ];
    const results = await Log.aggregate(agg);
    res.json({ results });
  } catch (err) { next(err); }
};

exports.activeUsers = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const agg = [
      { $match: { actionType: 'login-success', timestamp: { $gte: since } } },
      { $group: { _id: '$user' } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { id: '$user._id', name: '$user.name', email: '$user.email', role: '$user.role' } }
    ];
    const results = await Log.aggregate(agg);
    res.json({ count: results.length, results });
  } catch (err) { next(err); }
};