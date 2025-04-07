const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  photos: [{ type: String }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  membershipDetails: [{
    planName: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true } // Duration in days
  }],
  ownerDetails: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true }
  }
});

module.exports = mongoose.model('Gym', gymSchema);