const Tutor = require('../models/Tutor');
const User = require('../models/User');
const Session = require('../models/Session');
const Review = require('../models/Review');

class TutorController {
    // Create Tutor Profile
    async createTutorProfile(req, res) {
        try {
            const userId = req.user._id;
            const {
                bio,
                subjects,
                education,
                experience,
                languages,
                availability
            } = req.body;

            // Check if user is already a tutor
            const existingTutor = await Tutor.findOne({ user: userId });
            if (existingTutor) {
                return res.status(400).json({
                    success: false,
                    message: 'Tutor profile already exists'
                });
            }

            // Validate required fields
            if (!subjects || subjects.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one subject is required'
                });
            }

            const tutor = new Tutor({
                user: userId,
                bio,
                subjects,
                education: education || [],
                experience: experience || { years: 0, description: '' },
                languages: languages || [],
                availability: availability || { timezone: 'UTC', schedule: [] }
            });

            await tutor.save();

            // Update user role to tutor
            await User.findByIdAndUpdate(userId, { role: 'tutor' });

            res.status(201).json({
                success: true,
                message: 'Tutor profile created successfully',
                data: { tutor }
            });
        } catch (error) {
            console.error('Create tutor profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get Tutor Profile
    async getTutorProfile(req, res) {
        try {
            const userId = req.user._id;
            const tutor = await Tutor.findOne({ user: userId })
                .populate('user', 'name email avatar phone');

            if (!tutor) {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor profile not found'
                });
            }

            res.json({
                success: true,
                data: { tutor }
            });
        } catch (error) {
            console.error('Get tutor profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update Tutor Profile
    async updateTutorProfile(req, res) {
        try {
            const userId = req.user._id;
            const updateData = req.body;

            const tutor = await Tutor.findOneAndUpdate(
                { user: userId },
                updateData,
                { new: true, runValidators: true }
            ).populate('user', 'name email avatar phone');

            if (!tutor) {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor profile not found'
                });
            }

            res.json({
                success: true,
                message: 'Tutor profile updated successfully',
                data: { tutor }
            });
        } catch (error) {
            console.error('Update tutor profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Search Tutors
    async searchTutors(req, res) {
        try {
            const {
                subject,
                level,
                minPrice,
                maxPrice,
                minRating,
                location,
                page = 1,
                limit = 10,
                sortBy = 'rating',
                sortOrder = 'desc'
            } = req.query;

            const query = { isAvailable: true };
            const sort = {};

            // Build query
            if (subject) {
                query['subjects.subject'] = { $regex: subject, $options: 'i' };
            }

            if (level) {
                query['subjects.level'] = level;
            }

            if (minPrice || maxPrice) {
                query['subjects.hourlyRate'] = {};
                if (minPrice) query['subjects.hourlyRate'].$gte = parseInt(minPrice);
                if (maxPrice) query['subjects.hourlyRate'].$lte = parseInt(maxPrice);
            }

            if (minRating) {
                query['rating.average'] = { $gte: parseFloat(minRating) };
            }

            // Build sort
            if (sortBy === 'rating') {
                sort['rating.average'] = sortOrder === 'desc' ? -1 : 1;
            } else if (sortBy === 'price') {
                sort['subjects.hourlyRate'] = sortOrder === 'desc' ? -1 : 1;
            } else if (sortBy === 'experience') {
                sort['experience.years'] = sortOrder === 'desc' ? -1 : 1;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const tutors = await Tutor.find(query)
                .populate('user', 'name avatar')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Tutor.countDocuments(query);

            res.json({
                success: true,
                data: {
                    tutors,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / parseInt(limit)),
                        totalTutors: total,
                        hasNext: skip + tutors.length < total,
                        hasPrev: parseInt(page) > 1
                    }
                }
            });
        } catch (error) {
            console.error('Search tutors error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get Tutor by ID
    async getTutorById(req, res) {
        try {
            const { tutorId } = req.params;

            const tutor = await Tutor.findById(tutorId)
                .populate('user', 'name email avatar phone');

            if (!tutor) {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor not found'
                });
            }

            // Get tutor's reviews
            const reviews = await Review.find({ reviewee: tutor.user._id })
                .populate('reviewer', 'name avatar')
                .populate('session', 'subject scheduledDate')
                .sort({ createdAt: -1 })
                .limit(10);

            res.json({
                success: true,
                data: {
                    tutor,
                    reviews
                }
            });
        } catch (error) {
            console.error('Get tutor by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get Tutor Availability
    async getTutorAvailability(req, res) {
        try {
            const { tutorId } = req.params;
            const { date } = req.query;

            const tutor = await Tutor.findById(tutorId);
            if (!tutor) {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor not found'
                });
            }

            // Get booked sessions for the date
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);

            const bookedSessions = await Session.find({
                tutor: tutorId,
                scheduledDate: {
                    $gte: startDate,
                    $lt: endDate
                },
                status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
            });

            res.json({
                success: true,
                data: {
                    availability: tutor.availability,
                    bookedSessions
                }
            });
        } catch (error) {
            console.error('Get tutor availability error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update Tutor Availability
    async updateAvailability(req, res) {
        try {
            const userId = req.user._id;
            const { availability } = req.body;

            const tutor = await Tutor.findOneAndUpdate(
                { user: userId },
                { availability },
                { new: true }
            );

            if (!tutor) {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor profile not found'
                });
            }

            res.json({
                success: true,
                message: 'Availability updated successfully',
                data: { availability: tutor.availability }
            });
        } catch (error) {
            console.error('Update availability error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get Tutor Statistics
    async getTutorStats(req, res) {
        try {
            const userId = req.user._id;
            const tutor = await Tutor.findOne({ user: userId });

            if (!tutor) {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor profile not found'
                });
            }

            // Get session statistics
            const totalSessions = await Session.countDocuments({ tutor: tutor._id });
            const completedSessions = await Session.countDocuments({
                tutor: tutor._id,
                status: 'completed'
            });
            const upcomingSessions = await Session.countDocuments({
                tutor: tutor._id,
                status: { $in: ['scheduled', 'confirmed'] },
                scheduledDate: { $gte: new Date() }
            });

            // Get earnings
            const payments = await Payment.find({
                session: { $in: await Session.find({ tutor: tutor._id }).distinct('_id') },
                status: 'completed'
            });

            const totalEarnings = payments.reduce((sum, payment) => sum + payment.tutorEarnings, 0);

            // Get reviews
            const reviews = await Review.find({ reviewee: userId });
            const averageRating = reviews.length > 0 
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
                : 0;

            res.json({
                success: true,
                data: {
                    totalSessions,
                    completedSessions,
                    upcomingSessions,
                    totalEarnings,
                    averageRating,
                    totalReviews: reviews.length
                }
            });
        } catch (error) {
            console.error('Get tutor stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = new TutorController();
