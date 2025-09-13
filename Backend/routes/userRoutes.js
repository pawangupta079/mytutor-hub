const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected routes
router.get('/profile', authenticate, userController.getUserProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/dashboard', authenticate, userController.getDashboardData);

module.exports = router;