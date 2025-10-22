const Tutor = require('../models/Tutor');
const User = require('../models/User');
const Session = require('../models/Session');
const Review = require('../models/Review');

class TutorController {
    // Complete Tutor Registration (Multi-step)
    async completeTutorRegistration(req, res) {
        try {
            const userId = req.user._id;
            console.log('Complete tutor registration request for user:', userId);
            
            // Find existing tutor profile
            const tutor = await Tutor.findOne({ user: userId });
            console.log('Found tutor profile:', tutor ? tutor._id : 'Not found');
            
            if (!tutor) {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor profile not found. Please complete the registration steps first.'
                });
            }

            // Log current tutor data
            console.log('Tutor data:', {
                fullName: tutor.fullName,
                subjectsCount: tutor.subjects?.length || 0,
                hourlyRate: tutor.hourlyRate,
                isProfileComplete: tutor.isProfileComplete
            });

            // Validate that the profile has required data
            const validSubjects = tutor.subjects?.filter(s => 
                s.subject && s.subject.trim() !== '' && 
                s.level && s.level.trim() !== '' &&
                s.hourlyRate && s.hourlyRate >= 5
            ) || [];
            
            if (!tutor.fullName || validSubjects.length === 0 || !tutor.hourlyRate) {
                console.log('Validation failed:', {
                    hasFullName: !!tutor.fullName,
                    validSubjectsCount: validSubjects.length,
                    totalSubjectsCount: tutor.subjects?.length || 0,
                    hasHourlyRate: !!tutor.hourlyRate,
                    subjects: tutor.subjects
                });
                return res.status(400).json({
                    success: false,
                    message: 'Please complete all required fields: Full Name, at least one valid subject, and hourly rate.'
                });
            }

            // Save resume if provided
            if (req.body.resume) {
                tutor.resume = req.body.resume;
            }
            // Mark profile as complete and make tutor available
            tutor.isProfileComplete = true;
            tutor.isAvailable = true;
            tutor.isVerified = true; // Auto-verify for now
            await tutor.save();
            console.log('Tutor profile updated successfully');

            // Update user role to tutor
            await User.findByIdAndUpdate(userId, { role: 'tutor' });
            console.log('User role updated to tutor');

            res.status(200).json({
                success: true,
                message: 'Tutor registration completed successfully',
                data: { tutor }
            });
        } catch (error) {
            console.error('Complete tutor registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // DEBUG: List all tutors (no filters)
    async listAllTutors(req, res) {
        try {
            const tutors = await Tutor.find({}).populate('user', 'name email avatar role');
            res.json({ success: true, tutors });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching tutors', error: error.message });
        }
    }

    // Update Tutor Registration Step
    async updateTutorRegistrationStep(req, res) {
        try {
            // Check if user is authenticated
            if (!req.user || !req.user._id) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const userId = req.user._id;
            const { step, data } = req.body;

            console.log('Update tutor registration step:', { userId, step, data });

            // Validate step number
            if (!step || step < 1 || step > 3) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid step number. Must be between 1 and 3.'
                });
            }

            // Validate data
            if (!data) {
                return res.status(400).json({
                    success: false,
                    message: 'Data is required'
                });
            }

            // Check if tutor profile exists, if not create a basic one
            let tutor = await Tutor.findOne({ user: userId });
            if (!tutor) {
                console.log('Creating new tutor profile for user:', userId);
                // Create a new tutor profile with basic structure
                // We'll create it with the data from step 1 if available, otherwise with defaults
                const initialData = {
                    user: userId,
                    fullName: data.fullName || 'Temporary Name', // Use provided name or temporary
                    bio: data.bio || '',
                    location: {
                        city: data.location?.city || '',
                        country: data.location?.country || ''
                    },
                    profileImage: data.profileImage || '',
                    subjects: [],
                    qualifications: [],
                    experience: { years: 0, description: '' },
                    certificates: [],
                    languages: [],
                    hourlyRate: 25,
                    availability: {
                        timezone: 'UTC',
                        generalAvailability: '',
                        calendarSlots: []
                    },
                    isProfileComplete: false
                };
                
                tutor = new Tutor(initialData);
                await tutor.save();
                console.log('New tutor profile created:', tutor._id);
            } else {
                console.log('Found existing tutor profile:', tutor._id);
            }

            let updateData = {};

            switch (step) {
                case 1: // Personal Information
                    updateData = {
                        fullName: data.fullName || '',
                        bio: data.bio || '',
                        location: {
                            city: data.location?.city || '',
                            country: data.location?.country || ''
                        },
                        profileImage: data.profileImage || ''
                    };
                    break;
                case 2: // Expertise
                    // Filter out incomplete subjects
                    const validSubjects = (data.subjects || []).filter(s => 
                        s.subject && s.subject.trim() !== '' && 
                        s.level && s.level.trim() !== '' &&
                        s.hourlyRate && s.hourlyRate >= 5
                    );
                    
                    // Filter out incomplete qualifications
                    const validQualifications = (data.qualifications || []).filter(q => 
                        q.degree && q.degree.trim() !== '' && 
                        q.institution && q.institution.trim() !== '' && 
                        q.year && q.year > 0
                    );
                    
                    updateData = {
                        subjects: validSubjects,
                        qualifications: validQualifications,
                        experience: data.experience || { years: 0, description: '' },
                        certificates: data.certificates || [],
                        languages: data.languages || []
                    };
                    break;
                case 3: // Pricing & Availability
                    updateData = {
                        hourlyRate: data.hourlyRate || 25,
                        'availability.generalAvailability': data.generalAvailability || '',
                        'availability.calendarSlots': data.calendarSlots || []
                    };
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid step number'
                    });
            }

            console.log('Updating tutor with data:', updateData);
            const updatedTutor = await Tutor.findOneAndUpdate(
                { user: userId },
                updateData,
                { new: true, runValidators: true, upsert: true }
            ).populate('user', 'name email avatar phone');

            console.log('Tutor updated successfully:', updatedTutor._id);
            res.json({
                success: true,
                message: `Step ${step} updated successfully`,
                data: { tutor: updatedTutor }
            });
        } catch (error) {
            console.error('Update tutor registration step error:', error);
            
            // Handle specific validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                console.error('Validation errors:', validationErrors);
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: validationErrors,
                    details: error.errors
                });
            }
            
            // Handle duplicate key errors
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Tutor profile already exists for this user'
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Create Tutor Profile (Legacy method for backward compatibility)
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
                qualifications: education || [],
                experience: experience || { years: 0, description: '' },
                languages: languages || [],
                availability: availability || { timezone: 'UTC', calendarSlots: [] }
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
                sortOrder = 'desc',
                onlyComplete = 'true',
                onlyAvailable = 'true'
            } = req.query;

            const query = {};
            // Enforce availability/profile completeness based on flags (default true)
            if (String(onlyAvailable) !== 'false') {
                query.isAvailable = true;
            }
            if (String(onlyComplete) !== 'false') {
                query.isProfileComplete = true;
            }
            const sort = {};

            // Build query
            if (subject) {
                query['subjects.subject'] = { $regex: subject, $options: 'i' };
            }

            if (level) {
                query['subjects.level'] = level;
            }

            if (minPrice || maxPrice) {
                query.hourlyRate = {};
                if (minPrice) query.hourlyRate.$gte = parseInt(minPrice);
                if (maxPrice) query.hourlyRate.$lte = parseInt(maxPrice);
            }

            if (minRating) {
                query['rating.average'] = { $gte: parseFloat(minRating) };
            }

            if (location) {
                query.$or = [
                    { 'location.city': { $regex: location, $options: 'i' } },
                    { 'location.country': { $regex: location, $options: 'i' } }
                ];
            }

            // If onlyComplete flag was set above, it's already applied

            // Build sort
            if (sortBy === 'rating') {
                sort['rating.average'] = sortOrder === 'desc' ? -1 : 1;
            } else if (sortBy === 'price') {
                sort.hourlyRate = sortOrder === 'desc' ? -1 : 1;
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
