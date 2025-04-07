const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  type: { type: String, enum: ['Workout', 'Diet'], required: true },
  content: { type: String, required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  week: { type: Number, required: true }
});

module.exports = mongoose.model('Plan', planSchema);