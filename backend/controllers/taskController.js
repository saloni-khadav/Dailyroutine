const Task = require('../models/Task');

const getTasks = async (req, res) => {
  try {
    const { status, priority, age, sortBy = 'dueDate', page = 1, limit = 6 } = req.query;
    const filter = { userId: req.user._id };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    if (age) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (age === 'new') {
        filter.createdAt = { $gte: sevenDaysAgo };
      } else if (age === 'old') {
        filter.createdAt = { $lt: sevenDaysAgo };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tasks = await Task.find(filter)
      .sort({ [sortBy]: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalTasks = await Task.countDocuments(filter);
    const totalPages = Math.ceil(totalTasks / parseInt(limit));

    res.json({
      tasks,
      totalPages,
      currentPage: parseInt(page),
      totalTasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json(stats);
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, startTime, endTime, priority } = req.body;
    
    const task = new Task({
      title,
      description,
      dueDate,
      startTime,
      endTime,
      priority: priority || 'medium',
      status: 'pending',
      userId: req.user._id
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getTaskStats };