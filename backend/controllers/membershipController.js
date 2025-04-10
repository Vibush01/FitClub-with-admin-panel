const mongoose = require('mongoose');
const Membership = require('../models/Membership');
const Gym = require('../models/Gym');
const Trainer = require('../models/Trainer');
const Member = require('../models/Member');
const MembershipRenewalRequest = require('../models/MembershipRenewalRequest');

const getMemberships = async (req, res) => {
  try {
    if (req.user.role === 'Gym') {
      const gym = await Gym.findOne({ owner: new mongoose.Types.ObjectId(req.user.id) });
      if (!gym) {
        return res.status(403).json({ message: 'You are not associated with a gym' });
      }
      const memberships = await Membership.find({ gym: gym._id })
        .populate('member')
        .populate({
          path: 'member',
          populate: { path: 'user', select: 'name email' }
        });
      res.json(memberships);
    } else if (req.user.role === 'Trainer') {
      const trainer = await Trainer.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
      if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });
      const gym = await Gym.findById(trainer.gym);
      if (!gym) {
        return res.status(403).json({ message: 'You are not associated with a gym' });
      }
      const memberships = await Membership.find({ gym: gym._id })
        .populate('member')
        .populate({
          path: 'member',
          populate: { path: 'user', select: 'name email' }
        });
      res.json(memberships);
    } else if (req.user.role === 'Member') {
      const member = await Member.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
      if (!member || !member.gym) {
        return res.status(400).json({ message: 'You are not a member of any gym' });
      }
      const memberships = await Membership.find({ member: member._id })
        .populate('member')
        .populate({
          path: 'member',
          populate: { path: 'user', select: 'name email' }
        });
      res.json(memberships);
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch memberships', error: err.message });
  }
};

const createMembership = async (req, res) => {
  const { memberId, joinDate, expiryDate } = req.body;

  if (!memberId || !joinDate || !expiryDate) {
    return res.status(400).json({ message: 'Member ID, join date, and expiry date are required' });
  }

  try {
    const gym = await Gym.findOne({ owner: new mongoose.Types.ObjectId(req.user.id) });
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const member = await Member.findById(memberId);
    if (!member || member.gym.toString() !== gym._id.toString()) {
      return res.status(404).json({ message: 'Member not found in your gym' });
    }

    const existingMembership = await Membership.findOne({ member: memberId });
    if (existingMembership) {
      return res.status(400).json({ message: 'Member already has an active membership' });
    }

    const membership = new Membership({
      member: memberId,
      gym: gym._id,
      joinDate,
      expiryDate
    });
    await membership.save();

    res.status(201).json({ message: 'Membership created successfully', membership });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create membership', error: err.message });
  }
};

const updateMembership = async (req, res) => {
  const { joinDate, expiryDate } = req.body;

  try {
    const gym = await Gym.findOne({ owner: new mongoose.Types.ObjectId(req.user.id) });
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const membership = await Membership.findById(req.params.id);
    if (!membership || membership.gym.toString() !== gym._id.toString()) {
      return res.status(404).json({ message: 'Membership not found in your gym' });
    }

    membership.joinDate = joinDate || membership.joinDate;
    membership.expiryDate = expiryDate || membership.expiryDate;
    await membership.save();

    res.json({ message: 'Membership updated successfully', membership });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update membership', error: err.message });
  }
};

const deleteMembership = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner: new mongoose.Types.ObjectId(req.user.id) });
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const membership = await Membership.findById(req.params.id);
    if (!membership || membership.gym.toString() !== gym._id.toString()) {
      return res.status(404).json({ message: 'Membership not found in your gym' });
    }

    await Membership.deleteOne({ _id: membership._id });

    res.json({ message: 'Membership deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete membership', error: err.message });
  }
};

const requestMembershipRenewal = async (req, res) => {
  try {
    const member = await Member.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!member || !member.gym) {
      return res.status(400).json({ message: 'You are not a member of any gym' });
    }

    const membership = await Membership.findOne({ member: member._id });
    if (!membership) {
      return res.status(404).json({ message: 'No active membership found' });
    }

    const expiryDate = new Date(membership.expiryDate);
    const currentDate = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry > 7) {
      return res.status(400).json({ message: 'Membership can only be renewed within 7 days of expiry' });
    }

    const existingRequest = await MembershipRenewalRequest.findOne({
      member: member._id,
      gym: member.gym,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending renewal request' });
    }

    const renewalRequest = new MembershipRenewalRequest({
      member: member._id,
      gym: member.gym
    });
    await renewalRequest.save();

    res.status(201).json({ message: 'Membership renewal request sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send renewal request', error: err.message });
  }
};

const getRenewalRequests = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner: new mongoose.Types.ObjectId(req.user.id) });
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const renewalRequests = await MembershipRenewalRequest.find({ gym: gym._id, status: 'pending' })
      .populate('member')
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email' }
      });

    res.json(renewalRequests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch renewal requests', error: err.message });
  }
};

const respondToRenewalRequest = async (req, res) => {
  const { requestId, action } = req.body;

  if (!requestId || !action || !['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Request ID and action (accept/reject) are required' });
  }

  try {
    const gym = await Gym.findOne({ owner: new mongoose.Types.ObjectId(req.user.id) });
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const renewalRequest = await MembershipRenewalRequest.findById(requestId);
    if (!renewalRequest || renewalRequest.gym.toString() !== gym._id.toString()) {
      return res.status(404).json({ message: 'Renewal request not found or not associated with your gym' });
    }

    if (renewalRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Renewal request has already been processed' });
    }

    renewalRequest.status = action === 'accept' ? 'accepted' : 'rejected';
    await renewalRequest.save();

    if (action === 'accept') {
      const membership = await Membership.findOne({ member: renewalRequest.member });
      if (!membership) {
        return res.status(404).json({ message: 'Membership not found for this member' });
      }

      const expiryDate = new Date(membership.expiryDate);
      const newExpiryDate = new Date(expiryDate);
      newExpiryDate.setDate(newExpiryDate.getDate() + 30);
      membership.expiryDate = newExpiryDate;
      await membership.save();
    }

    await MembershipRenewalRequest.deleteOne({ _id: requestId });

    res.json({ message: `Renewal request ${action}ed successfully` });
  } catch (err) {
    res.status(500).json({ message: `Failed to ${action} renewal request`, error: err.message });
  }
};

const checkPendingRenewalRequest = async (req, res) => {
  try {
    const member = await Member.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!member || !member.gym) {
      return res.status(400).json({ message: 'You are not a member of any gym' });
    }

    const pendingRequest = await MembershipRenewalRequest.findOne({
      member: member._id,
      gym: member.gym,
      status: 'pending'
    });

    res.json({ hasPendingRequest: !!pendingRequest });
  } catch (err) {
    res.status(500).json({ message: 'Failed to check pending renewal request', error: err.message });
  }
};

module.exports = { getMemberships, createMembership, updateMembership, deleteMembership, requestMembershipRenewal, getRenewalRequests, respondToRenewalRequest, checkPendingRenewalRequest };