const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const Gym = require('../models/Gym');
const Trainer = require('../models/Trainer');
const Member = require('../models/Member');
const PlanRequest = require('../models/PlanRequest');

const getPlans = async (req, res) => {
  try {
    if (req.user.role === 'Trainer') {
      console.log(`Fetching plans for trainer with user ID: ${req.user.id}`);
      const trainer = await Trainer.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
      if (!trainer) {
        console.log('Trainer not found');
        return res.status(403).json({ message: 'Trainer not assigned to any gym' });
      }
      console.log(`Trainer found: ${trainer._id}, gym: ${trainer.gym}`);

      console.log(`Fetching gym: ${trainer.gym}`);
      const gym = await Gym.findById(trainer.gym);
      if (!gym) {
        console.log('Gym not found');
        return res.status(403).json({ message: 'You are not associated with a gym' });
      }
      console.log(`Gym found: ${gym._id}`);

      console.log(`Fetching plans for gym: ${gym._id}`);
      const plans = await Plan.find({ gym: new mongoose.Types.ObjectId(gym._id) })
        .populate('member', 'user')
        .populate('trainer', 'user');
      console.log(`Plans found by gym: ${JSON.stringify(plans)}`);

      // Fallback: If no plans are found by gym, try fetching by trainer
      if (plans.length === 0) {
        console.log(`No plans found by gym, fetching plans for trainer: ${trainer._id}`);
        const trainerPlans = await Plan.find({ trainer: trainer._id })
          .populate('member', 'user')
          .populate('trainer', 'user');
        console.log(`Plans found by trainer: ${JSON.stringify(trainerPlans)}`);
        return res.json(trainerPlans);
      }

      res.json(plans);
    } else if (req.user.role === 'Member') {
      console.log(`Fetching plans for member with user ID: ${req.user.id}`);
      const member = await Member.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
      if (!member || !member.gym) {
        console.log('Member not found or not associated with a gym');
        return res.status(400).json({ message: 'You are not a member of any gym' });
      }
      console.log(`Member found: ${member._id}`);

      console.log(`Fetching plans for member: ${member._id}`);
      const plans = await Plan.find({ member: member._id })
        .populate('member', 'user')
        .populate('trainer', 'user');
      console.log(`Plans found: ${JSON.stringify(plans)}`);

      res.json(plans);
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (err) {
    console.error('Error in getPlans:', err);
    res.status(500).json({ message: 'Failed to fetch plans', error: err.message });
  }
};

const assignPlan = async (req, res) => {
  const { type, content, memberId, week } = req.body;

  console.log(`Assigning plan: type=${type}, memberId=${memberId}, week=${week}`);

  if (!type || !content || !memberId || !week) {
    console.log('Missing required fields:', { type, content, memberId, week });
    return res.status(400).json({ message: 'Type, content, member ID, and week are required' });
  }

  try {
    console.log(`Fetching trainer for user ID: ${req.user.id}`);
    const trainer = await Trainer.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!trainer) {
      console.log('Trainer not found');
      return res.status(403).json({ message: 'Trainer not assigned to any gym' });
    }
    console.log(`Trainer found: ${trainer._id}, gym: ${trainer.gym}`);

    console.log(`Fetching gym: ${trainer.gym}`);
    const gym = await Gym.findById(trainer.gym);
    if (!gym) {
      console.log('Gym not found');
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }
    console.log(`Gym found: ${gym._id}`);

    console.log(`Fetching member: ${memberId}`);
    const member = await Member.findById(memberId);
    if (!member) {
      console.log('Member not found');
      return res.status(404).json({ message: 'Member not found in your gym' });
    }
    if (member.gym.toString() !== gym._id.toString()) {
      console.log(`Member gym (${member.gym}) does not match trainer's gym (${gym._id})`);
      return res.status(404).json({ message: 'Member not found in your gym' });
    }
    console.log(`Member found: ${member._id}`);

    console.log('Creating new plan');
    const plan = new Plan({
      type,
      content,
      member: memberId,
      gym: gym._id,
      trainer: trainer._id,
      week
    });
    await plan.save();
    console.log(`Plan saved: ${plan._id}`);

    res.status(201).json({ message: 'Plan assigned successfully', plan });
  } catch (err) {
    console.error('Error in assignPlan:', err);
    res.status(500).json({ message: 'Failed to assign plan', error: err.message });
  }
};

const updatePlan = async (req, res) => {
  const { content } = req.body;

  try {
    const trainer = await Trainer.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });

    const gym = await Gym.findById(trainer.gym);
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const plan = await Plan.findById(req.params.id);
    if (!plan || plan.gym.toString() !== gym._id.toString()) {
      return res.status(404).json({ message: 'Plan not found in your gym' });
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
    console.log(`Deleting plan with ID: ${req.params.id}`);
    const trainer = await Trainer.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!trainer) {
      console.log('Trainer not found');
      return res.status(403).json({ message: 'Trainer not assigned to any gym' });
    }
    console.log(`Trainer found: ${trainer._id}`);

    console.log(`Fetching plan: ${req.params.id}`);
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      console.log('Plan not found');
      return res.status(404).json({ message: 'Plan not found' });
    }
    console.log(`Plan found: ${plan._id}, trainer: ${plan.trainer}`);

    if (plan.trainer.toString() !== trainer._id.toString()) {
      console.log(`Plan trainer (${plan.trainer}) does not match current trainer (${trainer._id})`);
      return res.status(403).json({ message: 'You are not authorized to delete this plan' });
    }

    console.log(`Deleting plan: ${plan._id}`);
    await Plan.deleteOne({ _id: plan._id });
    console.log(`Plan deleted: ${plan._id}`);

    res.json({ message: 'Plan deleted successfully' });
  } catch (err) {
    console.error('Error in deletePlan:', err);
    res.status(500).json({ message: 'Failed to delete plan', error: err.message });
  }
};

const getPlanRequests = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });

    const gym = await Gym.findById(trainer.gym);
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const planRequests = await PlanRequest.find({ gym: gym._id, status: 'pending' })
      .populate('member')
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email' }
      });

    res.json(planRequests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plan requests', error: err.message });
  }
};

const fulfillPlanRequest = async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({ message: 'Request ID is required' });
  }

  try {
    const trainer = await Trainer.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });

    const gym = await Gym.findById(trainer.gym);
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const planRequest = await PlanRequest.findById(requestId);
    if (!planRequest || planRequest.gym.toString() !== gym._id.toString()) {
      return res.status(404).json({ message: 'Plan request not found or not associated with your gym' });
    }

    if (planRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Plan request has already been processed' });
    }

    planRequest.status = 'fulfilled';
    await planRequest.save();

    res.json({ message: 'Plan request marked as fulfilled' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fulfill plan request', error: err.message });
  }
};

module.exports = { getPlans, assignPlan, updatePlan, deletePlan, getPlanRequests, fulfillPlanRequest };