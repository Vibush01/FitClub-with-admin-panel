const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { createGym, getAllGyms, getGymById, updateGym, deleteGym } = require('../controllers/gymController');

const router = express.Router();

// All routes protected and restricted to Owner
router.use(authMiddleware);
router.use(restrictTo('Owner'));

router.post('/', createGym);
router.get('/', getAllGyms);
router.get('/:id', getGymById);
router.put('/:id', updateGym);
router.delete('/:id', deleteGym);

module.exports = router;