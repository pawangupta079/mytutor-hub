const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Session = require('../models/Session');
const Tutor = require('../models/Tutor');

class PaymentController {
    // Create Payment Intent
    async createPaymentIntent(req, res) {
        try {
            const { sessionId } = req.body;
            const userId = req.user._id;

            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    message: 'Session ID is required'
                });
            }

            // Get session details
            const session = await Session.findById(sessionId)
                .populate('tutor', 'user')
                .populate('student', 'name email');

            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
            }

            // Check if user owns this session
            if (session.student._id.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Check if session is already paid
            if (session.paymentStatus === 'paid') {
                return res.status(400).json({
                    success: false,
                    message: 'Session is already paid'
                });
            }

            // Calculate platform fee (10%)
            const platformFee = Math.round(session.price * 0.1 * 100) / 100;
            const tutorEarnings = session.price - platformFee;

            // Create payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(session.price * 100), // Convert to cents
                currency: 'usd',
                metadata: {
                    sessionId: sessionId,
                    userId: userId,
                    tutorId: session.tutor._id.toString()
                },
                description: `Payment for ${session.subject} session with ${session.tutor.user.name}`
            });

            // Create payment record
            const payment = new Payment({
                user: userId,
                session: sessionId,
                amount: session.price,
                currency: 'USD',
                status: 'pending',
                stripePaymentIntentId: paymentIntent.id,
                platformFee,
                tutorEarnings,
                description: `Payment for ${session.subject} session`
            });

            await payment.save();

            res.json({
                success: true,
                data: {
                    clientSecret: paymentIntent.client_secret,
                    paymentId: payment._id
                }
            });
        } catch (error) {
            console.error('Create payment intent error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Confirm Payment
    async confirmPayment(req, res) {
        try {
            const { paymentId } = req.body;
            const userId = req.user._id;

            if (!paymentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment ID is required'
                });
            }

            const payment = await Payment.findOne({
                _id: paymentId,
                user: userId
            }).populate('session');

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Retrieve payment intent from Stripe
            const paymentIntent = await stripe.paymentIntents.retrieve(
                payment.stripePaymentIntentId
            );

            if (paymentIntent.status === 'succeeded') {
                // Update payment status
                payment.status = 'completed';
                payment.processedAt = new Date();
                await payment.save();

                // Update session payment status
                await Session.findByIdAndUpdate(payment.session._id, {
                    paymentStatus: 'paid',
                    paymentId: payment._id
                });

                // Update tutor earnings
                const tutor = await Tutor.findById(payment.session.tutor);
                if (tutor) {
                    tutor.totalEarnings += payment.tutorEarnings;
                    await tutor.save();
                }

                res.json({
                    success: true,
                    message: 'Payment confirmed successfully',
                    data: { payment }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Payment not completed',
                    data: { status: paymentIntent.status }
                });
            }
        } catch (error) {
            console.error('Confirm payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get Payment History
    async getPaymentHistory(req, res) {
        try {
            const userId = req.user._id;
            const { page = 1, limit = 10, status } = req.query;

            const query = { user: userId };
            if (status) {
                query.status = status;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const payments = await Payment.find(query)
                .populate('session', 'subject scheduledDate tutor')
                .populate('session.tutor', 'user subjects')
                .populate('session.tutor.user', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Payment.countDocuments(query);

            res.json({
                success: true,
                data: {
                    payments,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / parseInt(limit)),
                        totalPayments: total,
                        hasNext: skip + payments.length < total,
                        hasPrev: parseInt(page) > 1
                    }
                }
            });
        } catch (error) {
            console.error('Get payment history error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get Payment by ID
    async getPaymentById(req, res) {
        try {
            const { paymentId } = req.params;
            const userId = req.user._id;

            const payment = await Payment.findOne({
                _id: paymentId,
                user: userId
            }).populate('session', 'subject scheduledDate tutor')
              .populate('session.tutor', 'user subjects')
              .populate('session.tutor.user', 'name');

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            res.json({
                success: true,
                data: { payment }
            });
        } catch (error) {
            console.error('Get payment by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Refund Payment
    async refundPayment(req, res) {
        try {
            const { paymentId } = req.params;
            const { reason } = req.body;
            const userId = req.user._id;

            const payment = await Payment.findOne({
                _id: paymentId,
                user: userId
            }).populate('session');

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            if (payment.status !== 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Only completed payments can be refunded'
                });
            }

            // Check if session can be refunded (within 24 hours of session)
            const sessionDate = new Date(payment.session.scheduledDate);
            const now = new Date();
            const hoursUntilSession = (sessionDate - now) / (1000 * 60 * 60);

            if (hoursUntilSession < 24) {
                return res.status(400).json({
                    success: false,
                    message: 'Refunds are only allowed 24 hours before the session'
                });
            }

            // Create refund in Stripe
            const refund = await stripe.refunds.create({
                payment_intent: payment.stripePaymentIntentId,
                amount: Math.round(payment.amount * 100), // Full refund
                reason: 'requested_by_customer',
                metadata: {
                    reason: reason || 'No reason provided'
                }
            });

            // Update payment status
            payment.status = 'refunded';
            payment.refundId = refund.id;
            payment.refundAmount = payment.amount;
            payment.refundReason = reason;
            payment.refundedAt = new Date();
            await payment.save();

            // Update session status
            await Session.findByIdAndUpdate(payment.session._id, {
                paymentStatus: 'refunded',
                status: 'cancelled'
            });

            // Update tutor earnings
            const tutor = await Tutor.findById(payment.session.tutor);
            if (tutor) {
                tutor.totalEarnings -= payment.tutorEarnings;
                await tutor.save();
            }

            res.json({
                success: true,
                message: 'Payment refunded successfully',
                data: { payment }
            });
        } catch (error) {
            console.error('Refund payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Webhook for Stripe events
    async handleWebhook(req, res) {
        try {
            const sig = req.headers['stripe-signature'];
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

            let event;

            try {
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            } catch (err) {
                console.error('Webhook signature verification failed:', err.message);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }

            // Handle the event
            switch (event.type) {
                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object;
                    await this.handlePaymentSuccess(paymentIntent);
                    break;
                case 'payment_intent.payment_failed':
                    const failedPayment = event.data.object;
                    await this.handlePaymentFailure(failedPayment);
                    break;
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            res.json({ received: true });
        } catch (error) {
            console.error('Webhook error:', error);
            res.status(500).json({
                success: false,
                message: 'Webhook error',
                error: error.message
            });
        }
    }

    // Handle successful payment
    async handlePaymentSuccess(paymentIntent) {
        try {
            const payment = await Payment.findOne({
                stripePaymentIntentId: paymentIntent.id
            });

            if (payment) {
                payment.status = 'completed';
                payment.processedAt = new Date();
                await payment.save();

                // Update session
                await Session.findByIdAndUpdate(payment.session, {
                    paymentStatus: 'paid',
                    paymentId: payment._id
                });

                // Update tutor earnings
                const session = await Session.findById(payment.session);
                const tutor = await Tutor.findById(session.tutor);
                if (tutor) {
                    tutor.totalEarnings += payment.tutorEarnings;
                    await tutor.save();
                }
            }
        } catch (error) {
            console.error('Handle payment success error:', error);
        }
    }

    // Handle failed payment
    async handlePaymentFailure(paymentIntent) {
        try {
            const payment = await Payment.findOne({
                stripePaymentIntentId: paymentIntent.id
            });

            if (payment) {
                payment.status = 'failed';
                payment.failureReason = paymentIntent.last_payment_error?.message || 'Unknown error';
                await payment.save();
            }
        } catch (error) {
            console.error('Handle payment failure error:', error);
        }
    }
}

module.exports = new PaymentController();
