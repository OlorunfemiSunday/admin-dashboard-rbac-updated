const Log = require('../models/Log');
const activity = (actionType, meta = {}) => {
  return async (req, res, next) => {
    try {
      const userId = req.user ? req.user._id : undefined;
      await Log.create({ user: userId, actionType, ip: req.ip, meta });
    } catch (err) { console.error('Activity log failed', err); }
    next();
  };
};
module.exports = { activity };