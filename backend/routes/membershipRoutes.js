const express = require('express');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { getMemberships, createMembership, updateMembership, deleteMembership, requestMembershipRenewal, getRenewalRequests, respondToRenewalRequest, checkPendingRenewalRequest } = require('../controllers/membershipController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', restrictTo('Gym', 'Trainer', 'Member'), getMemberships);
router.post('/', restrictTo('Gym'), createMembership);
router.put('/:id', restrictTo('Gym'), updateMembership);
router.delete('/:id', restrictTo('Gym'), deleteMembership);
router.post('/renew', restrictTo('Member'), requestMembershipRenewal);
router.get('/renewal-requests', restrictTo('Gym'), getRenewalRequests);
router.post('/renewal-respond', restrictTo('Gym'), respondToRenewalRequest);
router.get('/pending-renewal', restrictTo('Member'), checkPendingRenewalRequest); // New endpoint

module.exports = router;