const User = require('../models/User');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Diary = require('../models/Diary');

const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true }
    ).select('-password');

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const { theme, notifications } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        'preferences.theme': theme,
        'preferences.notifications': notifications
      },
      { new: true }
    ).select('-password');

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Delete all user data
    await Promise.all([
      Task.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      Diary.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { updateProfile, updatePreferences, deleteAccount };