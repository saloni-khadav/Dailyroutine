const mongoose = require('mongoose');

const alarmSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: 'Alarm!'
  },
  active: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alarm', alarmSchema);