const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tutor',
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    }, 
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: [30, 'Session must be at least 30 minutes'],
        max: [480, 'Session cannot exceed 8 hours']
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    meetingLink: {
        type: String,
        default: ''
    },
    meetingId: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending'
    },
    paymentId: {
        type: String,
        default: ''
    },
    notes: {
        student: String,
        tutor: String
    },
    rating: {
        studentRating: {
            type: Number,
            min: 1,
            max: 5
        },
        tutorRating: {
            type: Number,
            min: 1,
            max: 5
        },
        studentReview: String,
        tutorReview: String
    },
    cancellationReason: String,
    cancelledBy: {
        type: String,
        enum: ['student', 'tutor', 'system']
    },
    cancelledAt: Date,
    completedAt: Date,
    recordingUrl: String
}, {
    timestamps: true
});

// Index for efficient queries
sessionSchema.index({ student: 1, scheduledDate: 1 });
sessionSchema.index({ tutor: 1, scheduledDate: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ scheduledDate: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
