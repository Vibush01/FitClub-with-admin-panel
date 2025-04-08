const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { addTrainer, getTrainers, updateTrainer, deleteTrainer } = require('../controllers/trainerController');

const router = express.Router();

router.use(authMiddleware);
router.use(restrictTo('Gym'));

router.post('/', addTrainer);
router.get('/', getTrainers);
router.put('/:id', updateTrainer);
router.delete('/:id', deleteTrainer);

module.exports = router;