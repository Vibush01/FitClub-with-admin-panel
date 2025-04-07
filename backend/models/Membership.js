const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  joinDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true }
});

module.exports = mongoose.model('Membership', membershipSchema);