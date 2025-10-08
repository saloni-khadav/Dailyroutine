const Alarm = require('../models/Alarm');

// Get all alarms for user
const getAlarms = async (req, res) => {
  try {
    const alarms = await Alarm.find({ userId: req.user._id });
    res.json(alarms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new alarm
const createAlarm = async (req, res) => {
  try {
    const { time, message } = req.body;
    const alarm = new Alarm({
      time,
      message: message || 'Alarm!',
      userId: req.user._id
    });
    await alarm.save();
    res.status(201).json(alarm);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update alarm
const updateAlarm = async (req, res) => {
  try {
    const { time, message } = req.body;
    const alarm = await Alarm.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { time, message },
      { new: true }
    );
    res.json(alarm);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete alarm
const deleteAlarm = async (req, res) => {
  try {
    await Alarm.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Alarm deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAlarms,
  createAlarm,
  updateAlarm,
  deleteAlarm
};