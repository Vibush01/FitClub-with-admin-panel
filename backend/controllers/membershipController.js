const Membership = require('../models/Membership');
const Member = require('../models/Member');
const Gym = require('../models/Gym');
const Trainer = require('../models/Trainer');

const addMembership = async (req, res) => {
  const { memberId, joinDate, expiryDate } = req.body;

  if (!memberId || !joinDate || !expiryDate) {
    return res.status(400).json({ message: 'Member ID, join date, and expiry date are required' });
  }

  try {
    // Determine user's gym
    let gym;
    if (req.user.role === 'Gym') {
      gym = await Gym.findOne({ owner: req.user.id });
    } else if (req.user.role === 'Trainer') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });
      gym = await Gym.findById(trainer.gym);
    }
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    // Verify member exists in this gym
    const member = await Member.findById(memberId);
    if (!member || member.gym.toString() !== gym._id.toString()) {
      return res.status(400).json({ message: 'Member not found in your gym' });
    }

    // Check for existing membership
    const existingMembership = await Membership.findOne({ member: memberId, gym: gym._id });
    if (existingMembership) {
      return res.status(400).json({ message: 'Member already has an active membership' });
    }

    const membership = new Membership({
      member: memberId,
      gym: gym._id,
      joinDate: new Date(joinDate),
      expiryDate: new Date(expiryDate)
    });

    await membership.save();
    res.status(201).json({ message: 'Membership added successfully', membership });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add membership', error: err.message });
  }
};

const getMemberships = async (req, res) => {
  try {
    let gym;
    if (req.user.role === 'Gym') {
      gym = await Gym.findOne({ owner: req.user.id });
    } else if (req.user.role === 'Trainer') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });
      gym = await Gym.findById(trainer.gym);
    }
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const memberships = await Membership.find({ gym: gym._id }).populate('member', 'contactNumber user').populate('user', 'email name');
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch memberships', error: err.message });
  }
};

const updateMembership = async (req, res) => {
  const { joinDate, expiryDate } = req.body;

  try {
    let gym;
    if (req.user.role === 'Gym') {
      gym = await Gym.findOne({ owner: req.user.id });
    } else if (req.user.role === 'Trainer') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });
      gym = await Gym.findById(trainer.gym);
    }
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const membership = await Membership.findById(req.params.id);
    if (!membership || membership.gym.toString() !== gym._id.toString()) {
      return res.status(404).json({ message: 'Membership not found in your gym' });
    }

    membership.joinDate = joinDate ? new Date(joinDate) : membership.joinDate;
    membership.expiryDate = expiryDate ? new Date(expiryDate) : membership.expiryDate;
    await membership.save();

    res.json({ message: 'Membership updated successfully', membership });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update membership', error: err.message });
  }
};

const deleteMembership = async (req, res) => {
  try {
    let gym;
    if (req.user.role === 'Gym') {
      gym = await Gym.findOne({ owner: req.user.id });
    } else if (req.user.role === 'Trainer') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });
      gym = await Gym.findById(trainer.gym);
    }
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const membership = await Membership.findById(req.params.id);
    if (!membership || membership.gym.toString() !== gym._id.toString()) {
      return res.status(404).json({ message: 'Membership not found in your gym' });
    }

    await Membership.deleteOne({ _id: membership._id });
    res.json({ message: 'Membership removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete membership', error: err.message });
  }
};

module.exports = { addMembership, getMemberships, updateMembership, deleteMembership };