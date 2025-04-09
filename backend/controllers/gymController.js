const Gym = require('../models/Gym');
const User = require('../models/User');

const createGym = async (req, res) => {
  const { name, address, photos, membershipDetails, ownerDetails } = req.body;

  if (!name || !address || !ownerDetails || !ownerDetails.fullName || !ownerDetails.phone) {
    return res.status(400).json({ message: 'Name, address, and owner details (fullName, phone) are required' });
  }

  try {
    const gymOwner = await User.findOne({ email: req.body.ownerEmail, role: 'Gym' });
    if (!gymOwner) {
      return res.status(400).json({ message: 'Gym owner email must correspond to an existing Gym user' });
    }

    const gym = new Gym({
      name,
      address,
      photos: photos || [],
      owner: gymOwner._id,
      trainers: [],
      members: [],
      membershipDetails: membershipDetails || [],
      ownerDetails
    });

    await gym.save();
    res.status(201).json({ message: 'Gym created successfully', gym });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create gym', error: err.message });
  }
};

const getAllGyms = async (req, res) => {
  try {
    const gyms = await Gym.find().populate('owner', 'email name');
    res.json(gyms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch gyms', error: err.message });
  }
};

const getGymById = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id).populate('owner', 'email name');
    if (!gym) return res.status(404).json({ message: 'Gym not found' });
    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch gym', error: err.message });
  }
};

const getMyGym = async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner: req.user.id })
      .populate('owner', 'email name')
      .populate('trainers', 'email name')
      .populate('members', 'email name');
    if (!gym) return res.status(404).json({ message: 'Gym not found for this owner' });
    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your gym', error: err.message });
  }
};

const updateGym = async (req, res) => {
  const { name, address, photos, membershipDetails, ownerDetails } = req.body;

  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ message: 'Gym not found' });

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
    const gym = await Gym.findByIdAndDelete(req.params.id);
    if (!gym) return res.status(404).json({ message: 'Gym not found' });
    res.json({ message: 'Gym deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete gym', error: err.message });
  }
};

module.exports = { createGym, getAllGyms, getGymById, getMyGym, updateGym, deleteGym };