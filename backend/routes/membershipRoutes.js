const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { addMembership, getMemberships, updateMembership, deleteMembership } = require('../controllers/membershipController');

const router = express.Router();

router.use(authMiddleware);
router.use(restrictTo('Gym', 'Trainer'));

router.post('/', addMembership);
router.get('/', getMemberships);
router.put('/:id', updateMembership);
router.delete('/:id', deleteMembership);

module.exports = router;