const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Session = require('../models/Session');
const Payment = require('../models/Payment');
const crypto = require('crypto');

// Helper to generate JWT tokens without relying on class context
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

class UserController {

    // Register User
    async registerUser(req, res) {
        try {
            const { name, email, password, role = 'student', phone } = req.body;

            console.log('Starting registration for email:', email);

            // Validation
            if (!name || !email || !password) {
                console.log('Validation failed: missing required fields');
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required fields'
                });
            }

            // Normalize email
            const normalizedEmail = email.toLowerCase().trim();
            console.log('Normalized email:', normalizedEmail);

            // Check if user already exists
            const existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser) {
                console.log('User already exists with email:', normalizedEmail);
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            }

            console.log('Creating new user');
            // Create user
            const user = new User({
                name: name.trim(),
                email: normalizedEmail,
                password,
                role,
                phone: phone ? phone.trim() : undefined
            });
// Save user to database
            console.log('Saving user to database');
            await user.save();
            console.log('User saved successfully');

            // Generate token
            console.log('Generating JWT token');
            const token = generateToken(user._id);
            console.log('Token generated successfully');

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user,
                    token
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Login User
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email and password'
                });
            }

            // Find user and include password for comparison
            const user = await User.findOne({ email }).select('+password');
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            // Check password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate token
            const token = generateToken(user._id);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: user.toJSON(),
                    token
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get User Profile
    async getUserProfile(req, res) {
        try {
            const user = await User.findById(req.user._id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: { user }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update User Profile
    async updateProfile(req, res) {
        try {
            const { name, phone, avatar } = req.body;
            const userId = req.user._id;

            const updateData = {};
            if (name) updateData.name = name;
            if (phone) updateData.phone = phone;
            if (avatar) updateData.avatar = avatar;

            const user = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            );

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { user }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get User Dashboard Data
    async getDashboardData(req, res) {
        try {
            const userId = req.user._id;
            const userRole = req.user.role;

            let dashboardData = {};

            if (userRole === 'student') {
                // Get student's sessions
                const sessions = await Session.find({ student: userId })
                    .populate('tutor', 'user subjects rating')
                    .populate('tutor.user', 'name avatar')
                    .sort({ scheduledDate: -1 })
                    .limit(10);

                // Get upcoming sessions
                const upcomingSessions = await Session.find({
                    student: userId,
                    status: { $in: ['scheduled', 'confirmed'] },
                    scheduledDate: { $gte: new Date() }
                })
                .populate('tutor', 'user subjects')
                .populate('tutor.user', 'name avatar')
                .sort({ scheduledDate: 1 });

                // Get payment history
                const payments = await Payment.find({ user: userId })
                    .populate('session', 'subject scheduledDate')
                    .sort({ createdAt: -1 })
                    .limit(10);

                dashboardData = {
                    sessions,
                    upcomingSessions,
                    payments
                };
            } else if (userRole === 'tutor') {
                // Get tutor's sessions
                const tutor = await Tutor.findOne({ user: userId });
                if (!tutor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Tutor profile not found'
                    });
                }

                const sessions = await Session.find({ tutor: tutor._id })
                    .populate('student', 'name avatar')
                    .sort({ scheduledDate: -1 })
                    .limit(10);

                // Get upcoming sessions
                const upcomingSessions = await Session.find({
                    tutor: tutor._id,
                    status: { $in: ['scheduled', 'confirmed'] },
                    scheduledDate: { $gte: new Date() }
                })
                .populate('student', 'name avatar')
                .sort({ scheduledDate: 1 });

                // Get earnings
                const payments = await Payment.find({ 
                    session: { $in: sessions.map(s => s._id) },
                    status: 'completed'
                });

                const totalEarnings = payments.reduce((sum, payment) => sum + payment.tutorEarnings, 0);

                dashboardData = {
                    tutor,
                    sessions,
                    upcomingSessions,
                    totalEarnings,
                    totalSessions: sessions.length
                };
            }

            res.json({
                success: true,
                data: dashboardData
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Forgot Password
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email address'
                });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found with this email'
                });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(20).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

            await user.save();

            // In a real application, send email with reset link
            // For now, we'll just return the token (remove this in production)
            res.json({
                success: true,
                message: 'Password reset token generated',
                resetToken // Remove this in production
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Reset Password
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide token and new password'
                });
            }

            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token'
                });
            }

            user.password = newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            res.json({
                success: true,
                message: 'Password reset successfully'
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = new UserController();