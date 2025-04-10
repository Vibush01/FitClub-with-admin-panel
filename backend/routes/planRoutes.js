const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { getPlans, assignPlan, updatePlan, deletePlan, getPlanRequests, fulfillPlanRequest } = require('../controllers/planController');

const router = express.Router();

router.use(authMiddleware);
router.use(restrictTo('Trainer', 'Member'));

router.get('/', getPlans);
router.post('/', restrictTo('Trainer'), assignPlan);
router.put('/:id', restrictTo('Trainer'), updatePlan);
router.delete('/:id', restrictTo('Trainer'), deletePlan);
router.get('/requests', restrictTo('Trainer'), getPlanRequests);
router.post('/fulfill', restrictTo('Trainer'), fulfillPlanRequest);

module.exports = router;