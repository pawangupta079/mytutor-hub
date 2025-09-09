const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/authMiddleware');

// Protected routes
router.post('/create-intent', authenticate, paymentController.createPaymentIntent);
router.post('/confirm', authenticate, paymentController.confirmPayment);
router.get('/history', authenticate, paymentController.getPaymentHistory);
router.get('/:paymentId', authenticate, paymentController.getPaymentById);
router.post('/:paymentId/refund', authenticate, paymentController.refundPayment);

// Webhook (no auth required)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
