const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Protected routes
router.post('/book', authenticate, authorize('student'), sessionController.bookSession);
router.get('/my-sessions', authenticate, sessionController.getUserSessions);
router.get('/:sessionId', authenticate, sessionController.getSessionById);
router.put('/:sessionId/status', authenticate, sessionController.updateSessionStatus);
router.put('/:sessionId/cancel', authenticate, sessionController.cancelSession);
router.get('/tutor/:tutorId/available-slots', authenticate, sessionController.getAvailableSlots);

module.exports = router;
