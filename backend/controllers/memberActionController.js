const mongoose = require('mongoose');
const Member = require('../models/Member');
const Gym = require('../models/Gym');
const Trainer = require('../models/Trainer');
const PlanRequest = require('../models/PlanRequest');

const viewGymProfile = async (req, res) => {
  try {
    const member = await Member.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!member || !member.gym) {
      return res.status(400).json({ message: 'You are not a member of any gym' });
    }

    const gym = await Gym.findById(member.gym)
      .populate('owner', 'name email')
      .populate('trainers', 'name email')
      .populate('members', 'name email');

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch gym profile', error: err.message });
  }
};

const getTrainerGym = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!trainer) {
      return res.status(403).json({ message: 'Trainer not assigned to any gym' });
    }

    const gym = await Gym.findById(trainer.gym)
      .populate('owner', 'name email')
      .populate('trainers', 'name email')
      .populate('members', 'name email');

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch gym', error: err.message });
  }
};

const requestPlan = async (req, res) => {
  const { type, week } = req.body;

  if (!type || !week) {
    return res.status(400).json({ message: 'Plan type and week are required' });
  }

  try {
    const member = await Member.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!member || !member.gym) {
      return res.status(400).json({ message: 'You are not a member of any gym' });
    }

    const existingRequest = await PlanRequest.findOne({
      member: member._id,
      gym: member.gym,
      type,
      week,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending plan request for this type and week' });
    }

    const planRequest = new PlanRequest({
      member: member._id,
      gym: member.gym,
      type,
      week
    });
    await planRequest.save();

    res.status(201).json({ message: 'Plan request sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send plan request', error: err.message });
  }
};

module.exports = { viewGymProfile, getTrainerGym, requestPlan };