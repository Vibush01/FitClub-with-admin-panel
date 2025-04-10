const express = require('express');
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    const cors = require('cors');
    const path = require('path');
    const authRoutes = require('./routes/authRoutes');
    const gymRoutes = require('./routes/gymRoutes');
    const trainerRoutes = require('./routes/trainerRoutes');
    const memberRoutes = require('./routes/memberRoutes');
    const membershipRoutes = require('./routes/membershipRoutes');
    const planRoutes = require('./routes/planRoutes');
    const gymMemberRoutes = require('./routes/gymMemberRoutes');

    dotenv.config();

    const app = express();
    const PORT = process.env.PORT || 5000;

    // Enable CORS
    app.use(cors({
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    app.use(express.json());

    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log('MongoDB connected successfully'))
      .catch((err) => console.log('MongoDB connection error:', err));

    // Debug log for routes
    console.log('authRoutes:', authRoutes);
    console.log('gymRoutes:', gymRoutes);
    console.log('trainerRoutes:', trainerRoutes);
    console.log('memberRoutes:', memberRoutes);
    console.log('membershipRoutes:', membershipRoutes);
    console.log('planRoutes:', planRoutes);
    console.log('gymMemberRoutes:', gymMemberRoutes);

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/gyms', gymRoutes);
    app.use('/api/trainers', trainerRoutes);
    app.use('/api/members', memberRoutes);
    app.use('/api/memberships', membershipRoutes);
    app.use('/api/plans', planRoutes);
    app.use('/api/gym-members', gymMemberRoutes);

    app.get('/', (req, res) => {
      res.send('FitClub Backend is running!');
    });

    // Start the server and define member action routes after listening
    app.listen(PORT, () => {
      console.log(`FitClub server running on port ${PORT}`);

      // Define member action routes after the server starts
      const { authMiddleware, restrictTo } = require('./middleware/authMiddleware');
      const resolvedPath = require.resolve('./controllers/memberActionController');
      console.log('Resolved path for memberActionController:', resolvedPath);
      // Clear the module cache
      delete require.cache[resolvedPath];
      console.log('Cleared module cache for memberActionController');
      const memberActionControllerModule = require('./controllers/memberActionController');
      console.log('Raw memberActionController module:', memberActionControllerModule);
      const { viewGymProfile, getTrainerGym, requestPlan } = memberActionControllerModule;
      console.log('Loaded memberActionController after listen:', { viewGymProfile, getTrainerGym, requestPlan });

      const memberActionRouter = express.Router();
      memberActionRouter.get('/gym-profile', async (req, res, next) => {
        const { viewGymProfile } = require('./controllers/memberActionController');
        console.log('viewGymProfile:', viewGymProfile);
        return authMiddleware(req, res, () => restrictTo('Member')(req, res, () => viewGymProfile(req, res)));
      });

      memberActionRouter.get('/trainer-gym', async (req, res, next) => {
        const { getTrainerGym } = require('./controllers/memberActionController');
        console.log('getTrainerGym:', getTrainerGym);
        return authMiddleware(req, res, () => restrictTo('Trainer')(req, res, () => getTrainerGym(req, res)));
      });

      memberActionRouter.post('/request-plan', async (req, res, next) => {
        const { requestPlan } = require('./controllers/memberActionController');
        console.log('requestPlan:', requestPlan);
        return authMiddleware(req, res, () => restrictTo('Member')(req, res, () => requestPlan(req, res)));
      });

      app.use('/api/member', memberActionRouter);

      console.log('Mounted memberActionRoutes at /api/member after listen');
    });