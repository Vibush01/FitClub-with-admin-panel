const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Gym = require('./models/Gym');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Test Route to Add a Sample Gym User and Gym Profile
app.get('/test-gym', async (req, res) => {
  try {
    // Create Gym User
    const gymUser = new User({
      email: 'gym1@fitclub.com',
      password: 'password123', // Plaintext for testing; hash on Day 4
      role: 'Gym',
      name: 'Gym Owner 1'
    });
    await gymUser.save();

    // Create Gym Profile
    const gym = new Gym({
      name: 'FitClub Gym 1',
      address: '123 Fitness St, City',
      photos: ['http://example.com/photo1.jpg'],
      owner: gymUser._id,
      trainers: [],
      members: [],
      membershipDetails: [
        { planName: 'Basic', price: 500, duration: 30 },
        { planName: 'Premium', price: 1000, duration: 90 }
      ],
      ownerDetails: {
        fullName: 'John Doe',
        phone: '123-456-7890'
      }
    });
    await gym.save();

    res.send('Test gym created: ' + JSON.stringify({ user: gymUser, gym }));
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.get('/', (req, res) => {
  res.send('FitClub Backend is running!');
});

app.listen(PORT, () => {
  console.log(`FitClub server running on port ${PORT}`);
});