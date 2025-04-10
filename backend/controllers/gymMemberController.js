const mongoose = require('mongoose');
const Gym = require('../models/Gym');
const Member = require('../models/Member');
const JoinRequest = require('../models/JoinRequest');
const Trainer = require('../models/Trainer');

const getAllGyms = async (req, res) => {
  try {
    const gyms = await Gym.find()
      .populate('owner', 'name email')
      .populate('trainers', 'name email')
      .populate('members', 'name email');
    console.log(`Fetched ${gyms.length} gyms`);

    if (!req.user) {
      console.log('No user in request, returning gyms without request status');
      return res.json(gyms);
    }

    console.log(`Fetching Member for user ID: ${req.user.id}`);
    const member = await Member.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
    if (!member) {
      console.log(`Member not found for user ID: ${req.user.id}`);
      return res.status(400).json({ message: 'Member not found' });
    }
    console.log(`Member found: ${member._id}`);

    console.log(`Fetching JoinRequests for member: ${member._id}`);
    let joinRequests;
    try {
      joinRequests = await JoinRequest.find({ member: member._id, status: 'pending' });
    } catch (err) {
      console.error('Error fetching JoinRequests:', err);
      throw new Error('Failed to fetch join requests');
    }
    console.log(`JoinRequests found: ${JSON.stringify(joinRequests)}`);

    const joinRequestGymIds = joinRequests.map(request => {
      if (!request.gym) {
        console.error(`JoinRequest ${request._id} has no gym field: ${JSON.stringify(request)}`);
        return null;
      }
      return request.gym.toString();
    }).filter(id => id !== null);
    console.log(`Join request gym IDs: ${joinRequestGymIds}`);

    const gymsWithRequestStatus = gyms.map(gym => {
      console.log(`Checking gym ID: ${gym._id.toString()} for ${gym.name}`);
      const hasPendingRequest = joinRequestGymIds.includes(gym._id.toString());
      console.log(`Gym ${gym.name} hasPendingRequest: ${hasPendingRequest}`);
      return {
        ...gym.toObject(),
        hasPendingRequest: hasPendingRequest || false // Ensure hasPendingRequest is always defined
      };
    });

    console.log(`Returning gyms with request status: ${JSON.stringify(gymsWithRequestStatus)}`);
    return res.json(gymsWithRequestStatus);
  } catch (err) {
    console.error('Error in getAllGyms:', err);
    res.status(500).json({ message: 'Failed to fetch gyms', error: err.message });
  }
};

const joinGym = async (req, res) => {
  const { gymId } = req.body;

  if (!gymId) {
    return res.status(400).json({ message: 'Gym ID is required' });
  }

  try {
    console.log(`Attempting to find Member for user ID: ${req.user.id}`);
    let member = await Member.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });

    if (!member) {
      console.log(`Member not found for user ID: ${req.user.id}, creating new Member document`);
      member = new Member({
        user: new mongoose.Types.ObjectId(req.user.id)
      });
      await member.save();
      console.log(`New Member document created: ${member._id}`);
    } else {
      console.log(`Member found: ${member._id}`);
    }

    if (member.gym) {
      return res.status(400).json({ message: 'You are already a member of a gym' });
    }

    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const existingRequest = await JoinRequest.findOne({ member: member._id, gym: gymId, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending join request for this gym' });
    }

    const joinRequest = new JoinRequest({
      member: member._id,
      gym: gymId
    });
    await joinRequest.save();

    res.status(201).json({ message: 'Join request sent successfully' });
  } catch (err) {
    console.error('Error in joinGym:', err);
    res.status(500).json({ message: 'Failed to send join request', error: err.message });
  }
};

const getJoinRequests = async (req, res) => {
  try {
    let gym;
    if (req.user.role === 'Gym') {
      gym = await Gym.findOne({ owner: new mongoose.Types.ObjectId(req.user.id) });
    } else if (req.user.role === 'Trainer') {
      const trainer = await Trainer.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
      if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });
      gym = await Gym.findById(trainer.gym);
    }
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const joinRequests = await JoinRequest.find({ gym: gym._id, status: 'pending' })
      .populate('member', 'contactNumber')
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email' }
      });

    res.json(joinRequests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch join requests', error: err.message });
  }
};

const respondToJoinRequest = async (req, res) => {
  const { requestId, action } = req.body;

  if (!requestId || !action || !['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Request ID and action (accept/reject) are required' });
  }

  try {
    let gym;
    if (req.user.role === 'Gym') {
      gym = await Gym.findOne({ owner: new mongoose.Types.ObjectId(req.user.id) });
    } else if (req.user.role === 'Trainer') {
      const trainer = await Trainer.findOne({ user: new mongoose.Types.ObjectId(req.user.id) });
      if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });
      gym = await Gym.findById(trainer.gym);
    }
    if (!gym) {
      return res.status(403).json({ message: 'You are not associated with a gym' });
    }

    const joinRequest = await JoinRequest.findById(requestId);
    if (!joinRequest || joinRequest.gym.toString() !== gym._id.toString()) {
      return res.status(404).json({ message: 'Join request not found or not associated with your gym' });
    }

    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Join request has already been processed' });
    }

    joinRequest.status = action === 'accept' ? 'accepted' : 'rejected';
    await joinRequest.save();

    if (action === 'accept') {
      const member = await Member.findById(joinRequest.member);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      member.gym = gym._id;
      await member.save();

      if (!Array.isArray(gym.members)) {
        gym.members = [];
      }
      gym.members.push(member.user);
      await gym.save();
    }

    await JoinRequest.deleteOne({ _id: requestId });

    res.json({ message: `Join request ${action}ed successfully` });
  } catch (err) {
    res.status(500).json({ message: `Failed to ${action} join request`, error: err.message });
  }
};

module.exports = { getAllGyms, joinGym, getJoinRequests, respondToJoinRequest };