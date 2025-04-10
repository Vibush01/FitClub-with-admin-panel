const User = require('../models/User');
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
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role, name });
        await user.save();

        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
      } catch (err) {
        res.status(500).json({ message: 'Failed to signup', error: err.message });
      }
    };

    const login = async (req, res) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      try {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        const rawDateNow = Date.now();
        const currentTime = Math.floor(rawDateNow / 1000);
        const currentDate = new Date(rawDateNow);
        console.log('Raw Date.now():', rawDateNow);
        console.log('Current time (Unix timestamp):', currentTime);
        console.log('Current date:', currentDate.toISOString());

        // Fallback to a known good timestamp if the current time is incorrect
        const expectedTimestamp = Math.floor(new Date('2024-10-27T00:00:00Z').getTime() / 1000); // Adjust to current date
        const iat = currentTime > expectedTimestamp && currentTime < expectedTimestamp + 31536000 ? currentTime : expectedTimestamp;
        const expiresInSeconds = 3600; // 1 hour
        const exp = iat + expiresInSeconds;

        const token = jwt.sign(
          { id: user._id, role: user.role, iat: iat, exp: exp },
          process.env.JWT_SECRET
        );

        console.log('Generated token:', token);

        res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
      } catch (err) {
        console.error('Error in login:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
      }
    };

    module.exports = { signup, login };