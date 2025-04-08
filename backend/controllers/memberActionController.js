const Gym = require('../models/Gym');
const Member = require('../models/Member');
const Plan = require('../models/Plan');

const viewGymProfile = async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user.id });
    if (!member) {
      return res.status(400).json({ message: 'You are not a member of any gym' });
    }

    const gym = await Gym.findById(member.gym)
      .populate('owner', 'name email')
      .populate('trainers', 'name email');
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    res.json({
      name: gym.name,
      address: gym.address,
      photos: gym.photos,
      membershipDetails: gym.membershipDetails,
      owner: gym.owner,
      trainers: gym.trainers
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch gym profile', error: err.message });
  }
};

const requestPlan = async (req, res) => {
  const { type, week } = req.body;

  if (!type || !week) {
    return res.status(400).json({ message: 'Type and week are required' });
  }
  if (!['Workout', 'Diet'].includes(type)) {
    return res.status(400).json({ message: 'Type must be "Workout" or "Diet"' });
  }

  try {
    const member = await Member.findOne({ user: req.user.id });
    if (!member) {
      return res.status(400).json({ message: 'You are not a member of any gym' });
    }

    const existingPlan = await Plan.findOne({
      member: member._id,
      week,
      type
    });
    if (existingPlan) {
      return res.status(400).json({ message: `A ${type} plan already exists for week ${week}` });
    }

    const gym = await Gym.findById(member.gym);
    if (!gym || gym.trainers.length === 0) {
      return res.status(400).json({ message: 'No trainers available in your gym' });
    }

    const trainerId = gym.trainers[0];
    const trainer = await Trainer.findOne({ user: trainerId });

    const plan = new Plan({
      type,
      content: `Pending: ${type} plan requested by member`,
      trainer: trainer._id,
      member: member._id,
      week
    });

    await plan.save();
    res.status(201).json({ message: 'Plan request submitted successfully', plan });
  } catch (err) {
    res.status(500).json({ message: 'Failed to request plan', error: err.message });
  }
};

module.exports = { viewGymProfile, requestPlan };