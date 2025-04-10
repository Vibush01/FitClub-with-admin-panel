const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { getAllGyms, joinGym, getJoinRequests, respondToJoinRequest } = require('../controllers/gymMemberController');

const router = express.Router();

router.get('/', authMiddleware, getAllGyms);
router.post('/join', authMiddleware, restrictTo('Member'), joinGym);
router.get('/requests', authMiddleware, restrictTo('Gym', 'Trainer'), getJoinRequests);
router.post('/respond', authMiddleware, restrictTo('Gym', 'Trainer'), respondToJoinRequest);

module.exports = router;