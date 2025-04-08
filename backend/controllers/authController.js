const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Gym = require('../models/Gym');

const signup = async (req, res) => {
  const { email, password, role, name, gymDetails } = req.body;

  // Validation
  if (!email || !password || !role || !name) {
    return res.status(400).json({ message: 'All fields (email, password, role, name) are required' });
  }
  if (!['Owner', 'Gym', 'Trainer', 'Member'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      role,
      name
    });
    await user.save();

    if (role === 'Gym') {
      if (!gymDetails || !gymDetails.name || !gymDetails.address || !gymDetails.ownerDetails || !gymDetails.ownerDetails.fullName || !gymDetails.ownerDetails.phone) {
        await User.deleteOne({ _id: user._id }); // Rollback if gym details invalid
        return res.status(400).json({ message: 'Gym details (name, address, ownerDetails.fullName, ownerDetails.phone) required' });
      }
      const gym = new Gym({
        name: gymDetails.name,
        address: gymDetails.address,
        photos: gymDetails.photos || [],
        owner: user._id,
        trainers: [],
        members: [],
        membershipDetails: gymDetails.membershipDetails || [],
        ownerDetails: gymDetails.ownerDetails
      });
      await gym.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: { id: user._id, email, role, name } });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, email, role: user.role, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

module.exports = { signup, login };