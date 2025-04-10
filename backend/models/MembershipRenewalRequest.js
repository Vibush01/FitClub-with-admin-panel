const mongoose = require('mongoose');

const membershipRenewalRequestSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MembershipRenewalRequest', membershipRenewalRequestSchema);