const User = require('../models/User');

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

module.exports = { updateProfile, updatePreferences };