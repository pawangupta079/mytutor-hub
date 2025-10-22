const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: {
            type: String,
            enum: ['card', 'bank_transfer', 'wallet', 'other'],
            required: true
        },
        last4: String,
        brand: String
    },
    stripePaymentIntentId: {
        type: String,
        default: ''
    },
    stripeChargeId: {
        type: String,
        default: ''
    },
    refundId: {
        type: String,
        default: ''
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    refundReason: String,
    refundedAt: Date,
    platformFee: {
        type: Number,
        default: 0
    },
    tutorEarnings: {
        type: Number,
        required: true
    },
    description: String,
    metadata: {
        type: Map,
        of: String
    },
    failureReason: String,
    processedAt: Date
}, {
    timestamps: true
});

// Index for efficient queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ session: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
      