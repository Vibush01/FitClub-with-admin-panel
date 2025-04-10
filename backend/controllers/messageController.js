const mongoose = require('mongoose');
const Message = require('../models/Message');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Gym = require('../models/Gym');

const sendMessage = async (req, res) => {
  const { recipientId, content } = req.body;

  if (!recipientId || !content) {
    return res.status(400).json({ message: 'Recipient ID and content are required' });
  }

  try {
    let gym;
    if (req.user.role === 'Member') {
      const member = await Member.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
      if (!member || !member.gym) {
        return res.status(400).json({ message: 'You are not a member of any gym' });
      }
      gym = member.gym;
    } else if (req.user.role === 'Trainer') {
      const trainer = await Trainer.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
      if (!trainer || !trainer.gym) {
        return res.status(400).json({ message: 'You are not assigned to any gym' });
      }
      gym = trainer.gym;
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      content,
      gym
    });
    await message.save();

    res.status(201).json({ message: 'Message sent successfully', message });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

const getMessagesForMember = async (req, res) => {
  try {
    const member = await Member.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!member || !member.gym) {
      return res.status(400).json({ message: 'You are not a member of any gym' });
    }

    const trainers = await Trainer.find({ gym: member.gym }).populate('user', 'name email');
    if (!trainers || trainers.length === 0) {
      return res.status(404).json({ message: 'No trainers found for your gym' });
    }

    const trainerUserIds = trainers.map(trainer => trainer.user._id.toString());

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: { $in: trainerUserIds } },
        { sender: { $in: trainerUserIds }, recipient: req.user.id }
      ],
      gym: member.gym
    })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ timestamp: 1 });

    res.json({ trainers, messages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

const getMessagesForTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!trainer || !trainer.gym) {
      return res.status(400).json({ message: 'You are not assigned to any gym' });
    }

    const members = await Member.find({ gym: trainer.gym }).populate('user', 'name email');
    const memberUserIds = members.map(member => member.user._id.toString());

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: { $in: memberUserIds } },
        { sender: { $in: memberUserIds }, recipient: req.user.id }
      ],
      gym: trainer.gym
    })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ timestamp: 1 });

    res.json({ members, messages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

module.exports = { sendMessage, getMessagesForMember, getMessagesForTrainer };