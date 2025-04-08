const Trainer = require('../models/Trainer');
const Gym = require('../models/Gym');
const User = require('../models/User');

const addTrainer = async (req, res) => {
  const { trainerEmail } = req.body;

  if (!trainerEmail) {
    return res.status(400).json({ message: 'Trainer email is required' });
  }

  try {
    // Check if the requesting user is a Gym Owner
    const gym = await Gym.findOne({ owner: req.user.id });
    if (!gym) {
      return res.status(403).json({ message: 'Only Gym Owners can add trainers' });
    }

    // Verify trainer exists and has role "Trainer"
    const trainerUser = await User.findOne({ email: trainerEmail, role: 'Trainer' });
    if (!trainerUser) {
      return res.status(400).json({ message: 'Trainer email must correspond to an existing Trainer user' });
    }

    // Check if trainer is already assigned to this gym
    const existingTrainer = await Trainer.findOne({ user: trainerUser._id, gym: gym._id });
    if (existingTrainer) {
      return res.status(400).json({ message: 'Trainer already assigned to this gym' });
    }

    // Add trainer to gym
    const trainer = new Trainer({
      user: trainerUser._id,
      gym: gym._id
    });
    await trainer.save();

    // Update gym's trainers array
    gym.trainers.push(trainerUser._id);
    await gym.save();

    res.status(201).json({ message: 'Trainer added successfully', trainer });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add trainer', error: err.message });
  }
};

const getTrainers = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner: req.user.id });
    if (!gym) {
      return res.status(403).json({ message: 'Only Gym Owners can view trainers' });
    }

    const trainers = await Trainer.find({ gym: gym._id }).populate('user', 'email name');
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trainers', error: err.message });
  }
};

const updateTrainer = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner: req.user.id });
    if (!gym) {
      return res.status(403).json({ message: 'Only Gym Owners can update trainers' });
    }

    const trainer = await Trainer.findById(req.params.id);
    if (!trainer || trainer.gym.toString() !== gym._id.toString()) {
      return res.status(404).json({ message: 'Trainer not found in your gym' });
    }

    // For now, no fields to update in Trainer model; just return current state
    res.json({ message: 'Trainer details (no updates available yet)', trainer });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update trainer', error: err.message });
  }
};

const deleteTrainer = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner: req.user.id });
    if (!gym) {
      return res.status(403).json({ message: 'Only Gym Owners can delete trainers' });
    }

    const trainer = await Trainer.findById(req.params.id);
    if (!trainer || trainer.gym.toString() !== gym._id.toString()) {
      return res.status(404).json({ message: 'Trainer not found in your gym' });
    }

    await Trainer.deleteOne({ _id: trainer._id });
    gym.trainers = gym.trainers.filter(t => t.toString() !== trainer.user.toString());
    await gym.save();

    res.json({ message: 'Trainer removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete trainer', error: err.message });
  }
};

module.exports = { addTrainer, getTrainers, updateTrainer, deleteTrainer };