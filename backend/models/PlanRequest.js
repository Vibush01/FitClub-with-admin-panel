const mongoose = require('mongoose');

const planRequestSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  type: { type: String, enum: ['Workout', 'Diet'], required: true },
  week: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'fulfilled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlanRequest', planRequestSchema);