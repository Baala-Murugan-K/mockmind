import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';

export const getProfile = async (req, res) => {
  res.json({ success: true, data: { user: { id: req.user._id, name: req.user.name, email: req.user.email, createdAt: req.user.createdAt } } });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    const user = await User.findByIdAndUpdate(req.user._id, { name: name.trim() }, { new: true }).select('-password');
    res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email } } });
  } catch (err) { next(err); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both fields required' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
};
