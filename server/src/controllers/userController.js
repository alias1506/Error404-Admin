const User = require('../models/User');

const getAllUsers = async () => {
  try {
    return await User.find({}, '-password').sort({ createdAt: -1 });
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
};

const getUsersHandler = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(id, updates, { new: true, select: '-password' });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const bulkDeleteUsersHandler = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'Invalid or missing ids array' });
    }
    const result = await User.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${result.deletedCount} users deleted successfully` });
  } catch (error) {
    console.error('Error bulk deleting users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAllUsers,
  getUsersHandler,
  updateUserHandler,
  deleteUserHandler,
  bulkDeleteUsersHandler
};
