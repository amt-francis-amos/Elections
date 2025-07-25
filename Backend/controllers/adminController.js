import User from '../models/userModel.js';

export const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: "User is already an admin." });
    }

    user.role = 'admin';
    await user.save();

    res.status(200).json({ success: true, message: `${user.name} has been promoted to admin.` });
  } catch (error) {
    console.error("Promote to admin error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


// Delete user controller
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deleting self
    if (req.user._id.toString() === userId) {
      return res.status(403).json({ success: false, message: 'You cannot delete yourself.' });
    }

    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error while deleting user.' });
  }
};
