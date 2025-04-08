const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { listGyms, joinGym } = require('../controllers/gymMemberController');

const router = express.Router();

router.get('/', listGyms); // Public route
router.post('/join', authMiddleware, restrictTo('Member'), joinGym);

module.exports = router;