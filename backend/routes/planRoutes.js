const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { createPlan, getPlans, updatePlan, deletePlan } = require('../controllers/planController');

const router = express.Router();

router.use(authMiddleware);
router.use(restrictTo('Trainer'));

router.post('/', createPlan);
router.get('/', getPlans);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;