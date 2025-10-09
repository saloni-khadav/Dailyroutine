const Goal = require('../models/Goal');

const getGoals = async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const goals = await Goal.find({ userId: req.user._id })
      .sort({ deadline: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalGoals = await Goal.countDocuments({ userId: req.user._id });
    const totalPages = Math.ceil(totalGoals / parseInt(limit));

    res.json({
      goals,
      totalPages,
      currentPage: parseInt(page),
      totalGoals
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createGoal = async (req, res) => {
  try {
    const { title, description, deadline, progress = 0, type = 'short-term' } = req.body;
    
    const goal = new Goal({
      title,
      description,
      deadline,
      progress,
      type,
      userId: req.user._id
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };