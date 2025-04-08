const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { viewGymProfile, requestPlan } = require('../controllers/memberActionController');

const router = express.Router();

router.use(authMiddleware);
router.use(restrictTo('Member'));

router.get('/gym-profile', viewGymProfile);
router.post('/request-plan', requestPlan);

module.exports = router;