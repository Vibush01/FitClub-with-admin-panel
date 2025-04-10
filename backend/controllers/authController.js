const User = require('../models/User');
const Member = require('../models/Member');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  const { email, password, role, name } = req.body;

  if (!email || !password || !role || !name) {
    return res.status(400).json({ message: 'Email, password, role, and name are required' });
  }

  if (!['Owner', 'Gym', 'Trainer', 'Member'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    console.log(`Starting signup for email: ${email}, role: ${role}`);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User already exists: ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role,
      name
    });
    await user.save();
    console.log(`User created successfully: ${user._id}`);

    if (role === 'Member') {
      try {
        console.log(`Creating Member document for user: ${user._id}`);
        const member = new Member({
          user: user._id
        });
        await member.save();
        console.log(`Member document created successfully: ${member._id}`);
      } catch (memberErr) {
        console.error(`Failed to create Member document for user ${user._id}:`, memberErr);
        await User.deleteOne({ _id: user._id }); // Rollback user creation
        return res.status(500).json({ message: 'Failed to create member profile', error: memberErr.message });
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(`Signup successful for user: ${user._id}, token generated`);
    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Failed to signup', error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log(`Starting login for email: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(`Login successful for user: ${user._id}, token generated`);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Failed to login', error: err.message });
  }
};

module.exports = { signup, login };