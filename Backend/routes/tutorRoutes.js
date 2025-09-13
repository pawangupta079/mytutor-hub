const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');
const { authenticate, authorize, optionalAuth } = require('../middlewares/authMiddleware');

// Public routes
router.get('/search', optionalAuth, tutorController.searchTutors);
router.get('/:tutorId', optionalAuth, tutorController.getTutorById);
router.get('/:tutorId/availability', optionalAuth, tutorController.getTutorAvailability);

// Protected routes - Tutor only
router.post('/register/complete', authenticate, tutorController.completeTutorRegistration);
router.put('/register/step', authenticate, tutorController.updateTutorRegistrationStep);
router.post('/profile', authenticate, authorize('tutor'), tutorController.createTutorProfile);
router.get('/profile/me', authenticate, authorize('tutor'), tutorController.getTutorProfile);
router.put('/profile', authenticate, authorize('tutor'), tutorController.updateTutorProfile);
router.put('/availability', authenticate, authorize('tutor'), tutorController.updateAvailability);
router.get('/stats/me', authenticate, authorize('tutor'), tutorController.getTutorStats);

module.exports = router;
