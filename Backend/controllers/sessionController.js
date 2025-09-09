const Session = require('../models/Session');
const Tutor = require('../models/Tutor');
const User = require('../models/User');
const Payment = require('../models/Payment');

class SessionController {
    // Book a Session
    async bookSession(req, res) {
        try {
            const studentId = req.user._id;
            const {
                tutorId,
                subject,
                level,
                scheduledDate,
                duration,
                notes
            } = req.body;

            // Validate required fields
            if (!tutorId || !subject || !level || !scheduledDate || !duration) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required fields'
                });
            }

            // Check if tutor exists and is available
            const tutor = await Tutor.findById(tutorId);
            if (!tutor) {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor not found'
                });
            }

            if (!tutor.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: 'Tutor is not available for booking'
                });
            }

            // Check if student is trying to book their own session
            if (tutor.user.toString() === studentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot book session with yourself'
                });
            }

            // Find the subject and get hourly rate
            const subjectData = tutor.subjects.find(s => 
                s.subject.toLowerCase() === subject.toLowerCase() && 
                s.level === level
            );

            if (!subjectData) {
                return res.status(400).json({
                    success: false,
                    message: 'Tutor does not teach this subject at the specified level'
                });
            }

            // Check for time conflicts
            const sessionDate = new Date(scheduledDate);
            const endTime = new Date(sessionDate.getTime() + duration * 60000);

            const conflictingSession = await Session.findOne({
                $or: [
                    {
                        tutor: tutorId,
                        scheduledDate: {
                            $gte: sessionDate,
                            $lt: endTime
                        },
                        status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
                    },
                    {
                        student: studentId,
                        scheduledDate: {
                            $gte: sessionDate,
                            $lt: endTime
                        },
                        status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
                    }
                ]
            });

            if (conflictingSession) {
                return res.status(400).json({
                    success: false,
                    message: 'Time slot is not available'
                });
            }

            // Calculate price
            const price = (subjectData.hourlyRate * duration) / 60;

            // Create session
            const session = new Session({
                student: studentId,
                tutor: tutorId,
                subject,
                level,
                scheduledDate: sessionDate,
                duration,
                price,
                notes: { student: notes }
            });

            await session.save();

            // Populate the session data
            await session.populate([
                { path: 'student', select: 'name email avatar' },
                { path: 'tutor', select: 'user subjects rating' },
                { path: 'tutor.user', select: 'name avatar' }
            ]);

            res.status(201).json({
                success: true,
                message: 'Session booked successfully',
                data: { session }
            });
        } catch (error) {
            console.error('Book session error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get User Sessions
    async getUserSessions(req, res) {
        try {
            const userId = req.user._id;
            const userRole = req.user.role;
            const { status, page = 1, limit = 10 } = req.query;

            let query = {};
            let populateFields = [];

            if (userRole === 'student') {
                query.student = userId;
                populateFields = [
                    { path: 'tutor', select: 'user subjects rating' },
                    { path: 'tutor.user', select: 'name avatar' }
                ];
            } else if (userRole === 'tutor') {
                const tutor = await Tutor.findOne({ user: userId });
                if (!tutor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Tutor profile not found'
                    });
                }
                query.tutor = tutor._id;
                populateFields = [
                    { path: 'student', select: 'name avatar' }
                ];
            }

            if (status) {
                query.status = status;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const sessions = await Session.find(query)
                .populate(populateFields)
                .sort({ scheduledDate: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Session.countDocuments(query);

            res.json({
                success: true,
                data: {
                    sessions,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / parseInt(limit)),
                        totalSessions: total,
                        hasNext: skip + sessions.length < total,
                        hasPrev: parseInt(page) > 1
                    }
                }
            });
        } catch (error) {
            console.error('Get user sessions error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get Session by ID
    async getSessionById(req, res) {
        try {
            const { sessionId } = req.params;
            const userId = req.user._id;
            const userRole = req.user.role;

            let query = { _id: sessionId };

            // Ensure user can only access their own sessions
            if (userRole === 'student') {
                query.student = userId;
            } else if (userRole === 'tutor') {
                const tutor = await Tutor.findOne({ user: userId });
                if (!tutor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Tutor profile not found'
                    });
                }
                query.tutor = tutor._id;
            }

            const session = await Session.findOne(query)
                .populate('student', 'name email avatar')
                .populate('tutor', 'user subjects rating')
                .populate('tutor.user', 'name avatar');

            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
            }

            res.json({
                success: true,
                data: { session }
            });
        } catch (error) {
            console.error('Get session by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update Session Status
    async updateSessionStatus(req, res) {
        try {
            const { sessionId } = req.params;
            const { status, notes, meetingLink, meetingId } = req.body;
            const userId = req.user._id;
            const userRole = req.user.role;

            const session = await Session.findById(sessionId);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
            }

            // Check permissions
            if (userRole === 'student' && session.student.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            if (userRole === 'tutor') {
                const tutor = await Tutor.findOne({ user: userId });
                if (!tutor || session.tutor.toString() !== tutor._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied'
                    });
                }
            }

            // Update session
            const updateData = { status };
            if (notes) {
                if (userRole === 'student') {
                    updateData['notes.student'] = notes;
                } else if (userRole === 'tutor') {
                    updateData['notes.tutor'] = notes;
                }
            }
            if (meetingLink) updateData.meetingLink = meetingLink;
            if (meetingId) updateData.meetingId = meetingId;

            if (status === 'completed') {
                updateData.completedAt = new Date();
            }

            if (status === 'cancelled') {
                updateData.cancelledAt = new Date();
                updateData.cancelledBy = userRole;
            }

            const updatedSession = await Session.findByIdAndUpdate(
                sessionId,
                updateData,
                { new: true }
            ).populate('student', 'name avatar')
             .populate('tutor', 'user subjects')
             .populate('tutor.user', 'name avatar');

            res.json({
                success: true,
                message: 'Session status updated successfully',
                data: { session: updatedSession }
            });
        } catch (error) {
            console.error('Update session status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Cancel Session
    async cancelSession(req, res) {
        try {
            const { sessionId } = req.params;
            const { reason } = req.body;
            const userId = req.user._id;
            const userRole = req.user.role;

            const session = await Session.findById(sessionId);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
            }

            // Check permissions
            if (userRole === 'student' && session.student.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            if (userRole === 'tutor') {
                const tutor = await Tutor.findOne({ user: userId });
                if (!tutor || session.tutor.toString() !== tutor._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied'
                    });
                }
            }

            // Check if session can be cancelled
            if (['completed', 'cancelled'].includes(session.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Session cannot be cancelled'
                });
            }

            // Update session
            const updatedSession = await Session.findByIdAndUpdate(
                sessionId,
                {
                    status: 'cancelled',
                    cancellationReason: reason,
                    cancelledBy: userRole,
                    cancelledAt: new Date()
                },
                { new: true }
            );

            res.json({
                success: true,
                message: 'Session cancelled successfully',
                data: { session: updatedSession }
            });
        } catch (error) {
            console.error('Cancel session error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get Available Time Slots
    async getAvailableSlots(req, res) {
        try {
            const { tutorId } = req.params;
            const { date } = req.query;

            if (!date) {
                return res.status(400).json({
                    success: false,
                    message: 'Date is required'
                });
            }

            const tutor = await Tutor.findById(tutorId);
            if (!tutor) {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor not found'
                });
            }

            const requestedDate = new Date(date);
            const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

            // Get tutor's availability for the day
            const dayAvailability = tutor.availability.schedule.find(
                slot => slot.day === dayOfWeek && slot.isAvailable
            );

            if (!dayAvailability) {
                return res.json({
                    success: true,
                    data: { availableSlots: [] }
                });
            }

            // Get booked sessions for the date
            const startOfDay = new Date(requestedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(requestedDate);
            endOfDay.setHours(23, 59, 59, 999);

            const bookedSessions = await Session.find({
                tutor: tutorId,
                scheduledDate: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
            });

            // Generate available time slots
            const availableSlots = [];
            const startTime = dayAvailability.startTime;
            const endTime = dayAvailability.endTime;

            // Parse time strings and generate slots (30-minute intervals)
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);

            let currentTime = new Date(requestedDate);
            currentTime.setHours(startHour, startMin, 0, 0);

            const endDateTime = new Date(requestedDate);
            endDateTime.setHours(endHour, endMin, 0, 0);

            while (currentTime < endDateTime) {
                const slotEnd = new Date(currentTime.getTime() + 30 * 60000);
                
                // Check if this slot conflicts with booked sessions
                const hasConflict = bookedSessions.some(session => {
                    const sessionStart = new Date(session.scheduledDate);
                    const sessionEnd = new Date(sessionStart.getTime() + session.duration * 60000);
                    
                    return (currentTime < sessionEnd && slotEnd > sessionStart);
                });

                if (!hasConflict) {
                    availableSlots.push({
                        startTime: currentTime.toISOString(),
                        endTime: slotEnd.toISOString(),
                        duration: 30
                    });
                }

                currentTime.setMinutes(currentTime.getMinutes() + 30);
            }

            res.json({
                success: true,
                data: { availableSlots }
            });
        } catch (error) {
            console.error('Get available slots error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = new SessionController();
