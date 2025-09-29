const Diary = require('../models/Diary');

const getDiaryEntries = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { userId: req.user._id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const entries = await Diary.find(filter).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createDiaryEntry = async (req, res) => {
  try {
    const { date, content, mood } = req.body;
    
    const entry = new Diary({
      date,
      content,
      mood,
      userId: req.user._id
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Entry for this date already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDiaryEntry = async (req, res) => {
  try {
    const entry = await Diary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDiaryEntry = async (req, res) => {
  try {
    const entry = await Diary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    res.json({ message: 'Diary entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDiaryEntries, createDiaryEntry, updateDiaryEntry, deleteDiaryEntry };