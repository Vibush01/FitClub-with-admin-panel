const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { sendMessage, getMessagesForMember, getMessagesForTrainer } = require('../controllers/messageController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', restrictTo('Member', 'Trainer'), sendMessage);
router.get('/member', restrictTo('Member'), getMessagesForMember);
router.get('/trainer', restrictTo('Trainer'), getMessagesForTrainer);

module.exports = router;