const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { createGym, getAllGyms, getGymById, getMyGym, updateGym, deleteGym } = require('../controllers/gymController');

const router = express.Router();

// Gym Owner route (fetch their own gym)
router.get('/my-gym', authMiddleware, restrictTo('Gym'), getMyGym);

// Owner-only routes (CRUD for all gyms)
const ownerRouter = express.Router();
ownerRouter.use(authMiddleware);
ownerRouter.use(restrictTo('Owner'));

ownerRouter.post('/', createGym);
ownerRouter.get('/', getAllGyms);
ownerRouter.get('/:id', getGymById);
ownerRouter.put('/:id', updateGym);
ownerRouter.delete('/:id', deleteGym);

router.use(ownerRouter);

module.exports = router;