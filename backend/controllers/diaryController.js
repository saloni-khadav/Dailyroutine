const Diary = require('../models/Diary');

const getDiaryEntries = async (req, res) => {
  try {
    const { date, month, year } = req.query;
    const filter = { userId: req.user._id };
    
    if (date) {
      // Filter by specific date
      const startDate = new Date(date + 'T00:00:00.000Z');
      const endDate = new Date(date + 'T23:59:59.999Z');
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (month && year) {
      // Filter by month and year
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const entries = await Diary.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Get diary entries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createDiaryEntry = async (req, res) => {
  try {
    const { date, content, mood, emoji, textColor, textSize, image } = req.body;
    
    console.log('Creating diary entry for user:', req.user._id);
    console.log('Entry data:', { date, mood, emoji, textColor, textSize, hasImage: !!image });
    
    // Validate required fields
    if (!date || !content) {
      return res.status(400).json({ message: 'Date and content are required' });
    }
    
    // Check for existing entry on the same date
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
    const existingEntry = await Diary.findOne({ 
      userId: req.user._id, 
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    if (existingEntry) {
      return res.status(400).json({ message: 'Entry for this date already exists' });
    }
    
    const entry = new Diary({
      date: new Date(date),
      content,
      mood: mood || 'okay',
      emoji: emoji || '😐',
      textColor: textColor || '#374151',
      textSize: textSize || 16,
      image: image || '',
      userId: req.user._id
    });

    const savedEntry = await entry.save();
    console.log('Entry saved successfully:', savedEntry._id);
    res.status(201).json(savedEntry);
  } catch (error) {
    console.error('Create diary entry error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Entry for this date already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateDiaryEntry = async (req, res) => {
  try {
    const { date, content, mood, emoji, textColor, textSize, image } = req.body;
    
    console.log('Updating diary entry:', req.params.id);
    
    const updateData = {
      date: date ? new Date(date) : undefined,
      content,
      mood,
      emoji,
      textColor,
      textSize,
      image
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    const entry = await Diary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    console.log('Entry updated successfully');
    res.json(entry);
  } catch (error) {
    console.error('Update diary entry error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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