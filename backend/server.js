const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const gymRoutes = require('./routes/gymRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const memberRoutes = require('./routes/memberRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const planRoutes = require('./routes/planRoutes');
const gymMemberRoutes = require('./routes/gymMemberRoutes');
const memberActionRoutes = require('./routes/memberActionRoutes');
const messageRoutes = require('./routes/messageRoutes'); // Add message routes

dotenv.config();

const app = express();

// Enable CORS for the frontend origin
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/gym-members', gymMemberRoutes);
app.use('/api/member', memberActionRoutes);
app.use('/api/messages', messageRoutes); // Add message routes

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`FitClub server running on port ${PORT}`));
  })
  .catch(err => console.log('MongoDB connection error:', err));