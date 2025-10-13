const Goal = require('../models/Goal');

const getGoals = async (req, res) => {
  try {
    const { type, status, sortBy = 'createdAt', page = 1, limit = 6 } = req.query;
    console.log('Filter params:', { type, status, sortBy, page, limit });
    
    const filter = { userId: req.user._id };
    
    if (type) {
      if (type === 'short-term') {
        filter.$or = [{ type: 'short-term' }, { type: { $exists: false } }, { type: null }];
      } else {
        filter.type = type;
      }
      console.log('Applied type filter:', type);
    }
    
    if (status === 'completed') {
      filter.completed = true;
    } else if (status === 'in-progress') {
      filter.completed = false;
      filter.progress = { $gt: 0 };
    } else if (status === 'not-started') {
      filter.completed = false;
      filter.progress = 0;
    }

    console.log('Final filter:', filter);
    
    // Check all goals first
    const allGoals = await Goal.find({ userId: req.user._id });
    console.log('All goals types:', allGoals.map(g => ({ title: g.title, type: g.type || 'undefined' })));
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    let sortOption = {};
    if (sortBy === 'deadline') {
      sortOption.deadline = 1;
    } else if (sortBy === 'progress') {
      sortOption.progress = -1;
    } else {
      sortOption.createdAt = -1;
    }
    
    const goals = await Goal.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);
    
    console.log('Filtered goals:', goals.map(g => ({ title: g.title, type: g.type })));
    
    const totalGoals = await Goal.countDocuments(filter);
    const totalPages = Math.ceil(totalGoals / limitNum);

    res.json({
      goals,
      totalPages,
      currentPage: pageNum,
      totalGoals
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createGoal = async (req, res) => {
  try {
    const { title, description, deadline, type } = req.body;
    
    console.log('Creating goal with data:', { title, description, deadline, type });
    
    const goal = new Goal({
      title,
      description,
      deadline,
      type: type || 'short-term',
      completed: false,
      progress: 0,
      userId: req.user._id
    });

    const savedGoal = await goal.save();
    console.log('Saved goal:', savedGoal);
    res.status(201).json(savedGoal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };