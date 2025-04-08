const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { addMember, getMembers, updateMember, deleteMember } = require('../controllers/memberController');

const router = express.Router();

router.use(authMiddleware);
router.use(restrictTo('Gym', 'Trainer'));

router.post('/', addMember);
router.get('/', getMembers);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

module.exports = router;