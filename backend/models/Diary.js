const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'okay', 'bad', 'terrible'],
    default: 'okay'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

diarySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Diary', diarySchema);