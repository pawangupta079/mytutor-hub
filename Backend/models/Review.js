const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    helpful: {
        count: {
            type: Number,
            default: 0
        },
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    response: {
        comment: String,
        respondedAt: Date
    }
}, {
    timestamps: true
});

// Ensure one review per session per reviewer
reviewSchema.index({ session: 1, reviewer: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ reviewee: 1, rating: -1 });
reviewSchema.index({ reviewer: 1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
