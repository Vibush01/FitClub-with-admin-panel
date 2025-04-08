const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const gymRoutes = require('./routes/gymRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);

app.get('/', (req, res) => {
  res.send('FitClub Backend is running!');
});

app.listen(PORT, () => {
  console.log(`FitClub server running on port ${PORT}`);
});