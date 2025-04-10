const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { getGyms, createGym, updateGym, deleteGym } = require('../controllers/gymController');

console.log('Imported getGyms:', getGyms); // Debug log to verify getGyms

const router = express.Router();

router.get('/', authMiddleware, getGyms);
router.post('/', authMiddleware, restrictTo('Gym'), createGym);
router.put('/:id', authMiddleware, restrictTo('Gym'), updateGym);
router.delete('/:id', authMiddleware, restrictTo('Gym'), deleteGym);

module.exports = router;