const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Demo mode - return mock user
    const { name, email, password } = req.body;
    const mockUser = {
      _id: 'demo-user-id',
      name,
      email,
      preferences: { theme: 'light', notifications: true }
    };

    const token = generateToken(mockUser._id);

    res.status(201).json({
      token,
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        preferences: mockUser.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Demo mode - return mock user
    const { email, password } = req.body;
    const mockUser = {
      _id: 'demo-user-id',
      name: 'Demo User',
      email,
      preferences: { theme: 'light', notifications: true }
    };

    const token = generateToken(mockUser._id);

    res.json({
      token,
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        preferences: mockUser.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    // Demo mode - return mock user
    const mockUser = {
      id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@example.com',
      preferences: { theme: 'light', notifications: true }
    };
    
    res.json({ user: mockUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };