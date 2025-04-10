const Plan = require('../models/Plan');
const Trainer = require('../models/Trainer');
const Member = require('../models/Member');
const Gym = require('../models/Gym');

const createPlan = async (req, res) => {
  const { type, content, memberId, week } = req.body;

  if (!type || !content || !memberId || !week) {
    return res.status(400).json({ message: 'Type, content, member ID, and week are required' });
  }
  if (!['Workout', 'Diet'].includes(type)) {
    return res.status(400).json({ message: 'Type must be "Workout" or "Diet"' });
  }

  try {
    const trainer = await Trainer.findOne({ user: req.user.id });
    if (!trainer) {
      return res.status(403).json({ message: 'Trainer not assigned to any gym' });
    }
    const gym = await Gym.findById(trainer.gym);
    if (!gym) {
      return res.status(403).json({ message: 'Gym not found' });
    }

    const member = await Member.findById(memberId);
    if (!member || member.gym.toString() !== gym._id.toString()) {
      return res.status(400).json({ message: 'Member not found in your gym' });
    }

    const existingPlan = await Plan.findOne({ trainer: trainer._id, member: memberId, week, type });
    if (existingPlan) {
      return res.status(400).json({ message: `A ${type} plan already exists for this member for week ${week}` });
    }

    const plan = new Plan({
      type,
      content,
      trainer: trainer._id,
      member: memberId,
      week
    });

    await plan.save();
    res.status(201).json({ message: 'Plan created successfully', plan });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create plan', error: err.message });
  }
};

const getPlans = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user.id });
    if (!trainer) {
      return res.status(403).json({ message: 'Trainer not assigned to any gym' });
    }

    const plans = await Plan.find({ trainer: trainer._id })
      .populate({
        path: 'member',
        select: 'contactNumber',
        populate: { path: 'user', select: 'email name' }
      });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plans', error: err.message });
  }
};

const updatePlan = async (req, res) => {
  const { content } = req.body;

  try {
    const trainer = await Trainer.findOne({ user: req.user.id });
    if (!trainer) {
      return res.status(403).json({ message: 'Trainer not assigned to any gym' });
    }

    const plan = await Plan.findById(req.params.id);
    if (!plan || plan.trainer.toString() !== trainer._id.toString()) {
      return res.status(404).json({ message: 'Plan not found or not yours' });
    }

    plan.content = content || plan.content;
    await plan.save();

    res.json({ message: 'Plan updated successfully', plan });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update plan', error: err.message });
  }
};

const deletePlan = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user.id });
    if (!trainer) {
      return res.status(403).json({ message: 'Trainer not assigned to any gym' });
    }

    const plan = await Plan.findById(req.params.id);
    if (!plan || plan.trainer.toString() !== trainer._id.toString()) {
      return res.status(404).json({ message: 'Plan not found or not yours' });
    }

    await Plan.deleteOne({ _id: plan._id });
    res.json({ message: 'Plan removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete plan', error: err.message });
  }
};

module.exports = { createPlan, getPlans, updatePlan, deletePlan };