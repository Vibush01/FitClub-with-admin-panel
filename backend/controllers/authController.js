const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Gym = require('../models/Gym');

const signup = async (req, res) => {
  const { email, password, role, name, gymDetails } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      role,
      name
    });
    await user.save();

    // If role is Gym, create Gym profile
    if (role === 'Gym') {
      if (!gymDetails || !gymDetails.name || !gymDetails.address || !gymDetails.ownerDetails) {
        return res.status(400).json({ message: 'Gym details required' });
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

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: { id: user._id, email, role, name } });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, email, role: user.role, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

module.exports = { signup, login };