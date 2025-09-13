const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Personal Information
    fullName: {
        type: String,
        required: false, // Make it optional during registration process
        trim: true,
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    location: {
        city: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true
        }
    },
    profileImage: {
        type: String,
        default: ''
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
    // Expertise Information
    qualifications: [{
        degree: {
            type: String,
            required: true,
            trim: true
        },
        institution: {
            type: String,
            required: true,
            trim: true
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
            min: 0,
            max: 50
        },
        description: {
            type: String,
            maxlength: [1000, 'Experience description cannot exceed 1000 characters']
        }
    },
    certificates: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        issuingOrganization: {
            type: String,
            required: true,
            trim: true
        },
        issueDate: {
            type: Date
        },
        expiryDate: {
            type: Date
        },
        certificateUrl: {
            type: String
        }
    }],
    languages: [{
        type: String,
        trim: true
    }],
    // Pricing & Availability
    hourlyRate: {
        type: Number,
        required: [true, 'Hourly rate is required'],
        min: [5, 'Hourly rate must be at least $5'],
        max: [1000, 'Hourly rate cannot exceed $1000']
    },
    availability: {
        timezone: {
            type: String,
            default: 'UTC'
        },
        generalAvailability: {
            type: String,
            maxlength: [500, 'Availability description cannot exceed 500 characters']
        },
        calendarSlots: [{
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
    // Status and Verification
    isVerified: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    // Additional Documents
    documents: [{
        type: {
            type: String,
            enum: ['certificate', 'degree', 'id', 'other']
        },
        url: String,
        name: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Pre-save validation to ensure fullName is provided when profile is complete
tutorSchema.pre('save', function(next) {
    if (this.isProfileComplete && (!this.fullName || this.fullName.trim() === '')) {
        return next(new Error('Full name is required when profile is complete'));
    }
    next();
});

// Index for search functionality
tutorSchema.index({ 'subjects.subject': 1 });
tutorSchema.index({ 'subjects.level': 1 });
tutorSchema.index({ rating: -1 });
tutorSchema.index({ 'subjects.hourlyRate': 1 });

const Tutor = mongoose.model('Tutor', tutorSchema);

module.exports = Tutor;
