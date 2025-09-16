const Log = require('../models/Log');
const { exportLogs } = require('../utils/csvExport');

exports.getLogs = async (req, res, next) => {
  try {
    const { user, from, to, actionType, limit = 100, skip = 0 } = req.query;
    const q = {};
    if (user) q.user = user;
    if (actionType) q.actionType = actionType;
    if (from || to) q.timestamp = {};
    if (from) q.timestamp.$gte = new Date(from);
    if (to) q.timestamp.$lte = new Date(to);

    if (req.user.role === 'manager') {
      if (!user && !from && !to && !actionType) {
        return res.status(403).json({ error: 'Managers must provide at least one filter (user, from, to, actionType)' });
      }
    }

    const logs = await Log.find(q).sort({ timestamp: -1 }).limit(parseInt(limit)).skip(parseInt(skip)).populate('user', 'name email role');
    res.json({ count: logs.length, logs });
  } catch (err) { next(err); }
};

exports.exportLogs = async (req, res, next) => {
  try {
    const { format = 'csv' } = req.query;
    const logs = await Log.find({}).sort({ timestamp: -1 }).populate('user', 'name email role');
    if (format === 'csv') {
      const filePath = await exportLogs(logs);
      return res.download(filePath);
    }
    res.json(logs);
  } catch (err) { next(err); }
};

exports.deleteLog = async (req, res, next) => {
  try {
    const log = await Log.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json({ message: 'Log deleted' });
  } catch (err) { next(err); }
};