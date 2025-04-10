const mongoose = require('mongoose');
const Gym = require('../models/Gym');

const getGyms = async (req, res) => {
  try {
    const gyms = await Gym.find()
      .populate('owner', 'name email')
      .populate('trainers', 'name email')
      .populate('members', 'name email');

    if (!req.user) {
      return res.status(401).json({ message: 'No user, authorization denied' });
    }

    if (req.user.role === 'Gym') {
      const userGyms = gyms.filter(gym => gym.owner._id.toString() === req.user.id);
      if (userGyms.length === 0) {
        return res.status(404).json({ message: 'No gyms found for this owner' });
      }
      res.json(userGyms);
    } else if (req.user.role === 'Member' || req.user.role === 'Trainer') {
      res.json(gyms);
    } else {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
  } catch (err) {
    console.error('Error in getGyms:', err);
    res.status(500).json({ message: 'Failed to fetch gyms', error: err.message });
  }
};

const createGym = async (req, res) => {
  const { name, address, photos, membershipDetails, ownerDetails } = req.body;

  if (!name || !address || !membershipDetails || !ownerDetails) {
    return res.status(400).json({ message: 'Name, address, membership details, and owner details are required' });
  }

  try {
    const gym = new Gym({
      name,
      address,
      photos: photos || [],
      owner: req.user.id,
      membershipDetails,
      ownerDetails
    });
    await gym.save();

    res.status(201).json({ message: 'Gym created successfully', gym });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create gym', error: err.message });
  }
};

const updateGym = async (req, res) => {
  const { name, address, photos, membershipDetails, ownerDetails } = req.body;

  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (gym.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the owner of this gym' });
    }

    gym.name = name || gym.name;
    gym.address = address || gym.address;
    gym.photos = photos || gym.photos;
    gym.membershipDetails = membershipDetails || gym.membershipDetails;
    gym.ownerDetails = ownerDetails || gym.ownerDetails;
    await gym.save();

    res.json({ message: 'Gym updated successfully', gym });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update gym', error: err.message });
  }
};

const deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    if (gym.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: not the owner of this gym' });
    }

    await Gym.deleteOne({ _id: req.params.id });

    res.json({ message: 'Gym deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete gym', error: err.message });
  }
};

module.exports = { getGyms, createGym, updateGym, deleteGym };