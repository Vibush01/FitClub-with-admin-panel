const Gym = require('../models/Gym');
const Member = require('../models/Member');
const User = require('../models/User');

const listGyms = async (req, res) => {
  try {
    const gyms = await Gym.find()
      .select('name address photos membershipDetails ownerDetails')
      .populate('owner', 'name email')
      .populate('trainers', 'name email');
    res.json(gyms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch gyms', error: err.message });
  }
};

const joinGym = async (req, res) => {
  const { gymId, contactNumber } = req.body;

  if (!gymId || !contactNumber) {
    return res.status(400).json({ message: 'Gym ID and contact number are required' });
  }

  try {
    // Verify user is a Member
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'Member') {
      return res.status(403).json({ message: 'Only Members can join gyms' });
    }

    // Verify gym exists
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Check if member is already in a gym
    const existingMember = await Member.findOne({ user: req.user.id });
    if (existingMember) {
      return res.status(400).json({ message: 'You are already a member of a gym' });
    }

    // Add member to gym
    const member = new Member({
      user: req.user.id,
      gym: gymId,
      contactNumber
    });
    await member.save();

    gym.members.push(req.user.id);
    await gym.save();

    res.status(201).json({ message: 'Successfully joined gym', member });
  } catch (err) {
    res.status(500).json({ message: 'Failed to join gym', error: err.message });
  }
};

module.exports = { listGyms, joinGym };