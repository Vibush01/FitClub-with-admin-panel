const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { viewGymProfile, getTrainerGym, requestPlan } = require('../controllers/memberActionController');

const router = express.Router();

router.use(authMiddleware);

router.get('/gym-profile', restrictTo('Member'), viewGymProfile);
router.get('/trainer-gym', restrictTo('Trainer'), getTrainerGym);
router.post('/request-plan', restrictTo('Member'), requestPlan);

module.exports = router;