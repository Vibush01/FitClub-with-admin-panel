const mongoose = require('mongoose');

  const gymSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    photos: [String],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ownerDetails: {
      fullName: String,
      phone: String
    },
    trainers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    membershipDetails: [{
      planName: String,
      price: Number,
      duration: Number
    }]
  });

  module.exports = mongoose.model('Gym', gymSchema);