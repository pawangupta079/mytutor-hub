const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    subjects: [{
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
        hourlyRate: {
            type: Number,
            required: true,
            min: [5, 'Hourly rate must be at least $5']
        }
    }],
    education: [{
        degree: {
            type: String,
            required: true
        },
        institution: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        }
    }],
    experience: {
        years: {
            type: Number,
            default: 0,
            min: 0
        },
        description: String
    },
    languages: [{
        type: String,
        trim: true
    }],
    availability: {
        timezone: {
            type: String,
            default: 'UTC'
        },
        schedule: [{
            day: {
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            startTime: String,
            endTime: String,
            isAvailable: {
                type: Boolean,
                default: true
            }
        }]
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    totalSessions: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    profileImage: {
        type: String,
        default: ''
    },
    documents: [{
        type: {
            type: String,
            enum: ['certificate', 'degree', 'id', 'other']
        },
        url: String,
        name: String
    }]
}, {
    timestamps: true
});

// Index for search functionality
tutorSchema.index({ 'subjects.subject': 1 });
tutorSchema.index({ 'subjects.level': 1 });
tutorSchema.index({ rating: -1 });
tutorSchema.index({ 'subjects.hourlyRate': 1 });

const Tutor = mongoose.model('Tutor', tutorSchema);

module.exports = Tutor;
