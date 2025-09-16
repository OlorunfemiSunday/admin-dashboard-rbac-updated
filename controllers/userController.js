const User = require('../models/User');
const Log = require('../models/Log');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').limit(100);
    res.json({ count: users.length, users });
  } catch (err) { next(err); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin','manager','user'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const oldRole = user.role;
    user.role = role;
    await user.save();
    await Log.create({ user: req.user._id, actionType: 'role-change', ip: req.ip, meta: { targetUser: user._id, oldRole, newRole: role } });
    res.json({ message: 'Role updated', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await Log.create({ user: req.user._id, actionType: 'user-deleted', ip: req.ip, meta: { targetUser: user._id } });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};