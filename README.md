# MyTutor - Online Tutoring Platform

A full-stack MERN application that connects students with expert tutors for personalized learning experiences.

## 🚀 Features

### For Students
- **Tutor Search**: Find tutors by subject, level, rating, and price
- **Session Booking**: Book sessions with available time slots
- **Interactive Learning**: Video sessions with whiteboard and chat
- **Progress Tracking**: Analytics and performance monitoring
- **Payment System**: Secure payment processing with Stripe
- **Dashboard**: Manage sessions, payments, and learning progress

### For Tutors
- **Profile Management**: Create detailed tutor profiles with qualifications
- **Availability Management**: Set and manage available time slots
- **Session Management**: Handle bookings, confirmations, and cancellations
- **Earnings Tracking**: Monitor income and payment history
- **Student Reviews**: Receive and respond to student feedback

### General Features
- **Authentication**: JWT-based secure authentication
- **Role-based Access**: Different interfaces for students, tutors, and admins
- **Real-time Updates**: Live session status and notifications
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Beautiful interface with shadcn/ui components

## Project Architecture

```
[Clients: Web/Mobile Apps (React/React Native)]
          |
          | (HTTPS/WebSockets)
          v
[API Gateway (AWS API Gateway)]
          |
          | (Load Balanced Requests)
          +-------------------+-------------------+
          |                   |                   |
[Auth Service]       [User/Scheduling Service]   [Session Service (WebRTC)]
(JWT, OAuth)         (PostgreSQL, Elasticsearch) (Socket.io, Agora/Twilio)
          |                   |                   |
          +-------------------+-------------------+
                              |
                              | (Events)
                              v
[Message Broker (Kafka/RabbitMQ)]
                              |
                              +-------------------+-------------------+
                              |                   |                   |
                     [Payment Service]   [Notification Service]   [Analytics Service]
                      (Stripe)             (FCM/Twilio)            (ELK Stack)
                              |
                              v
[Data Layer: PostgreSQL | MongoDB | Redis | S3]
          |
          v
[Infrastructure: Kubernetes | Monitoring (Prometheus/Grafana) | CI/CD]

```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Stripe** for payment processing
- **Helmet** for security
- **CORS** for cross-origin requests

### Database
- **MongoDB Atlas** for cloud database
- **Mongoose** for ODM and schema validation

## 📁 Project Structure

```
mytutor-hub/
├── Backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── tutorController.js
│   │   ├── sessionController.js
│   │   └── paymentController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Tutor.js
│   │   ├── Session.js
│   │   ├── Payment.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── tutorRoutes.js
│   │   ├── sessionRoutes.js
│   │   └── paymentRoutes.js
│   ├── server.js
│   └── package.json
├── Frontend/
│   ├── client/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── ui/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Index.tsx
│   │   │   ├── FindTutor.tsx
│   │   │   ├── BookSession.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── TutorDashboard.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   └── lib/
│   ├── shared/
│   │   └── api.ts
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mytutor-hub
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Setup**

   **Backend Environment (.env)**
   ```env
   MONGO_URI=mongodb://localhost:27017/mytutor
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

   **Frontend Environment (.env)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   ```

5. **Start the Development Servers**

   **Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```

   **Frontend Server**
   ```bash
   cd Frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - API Health Check: http://localhost:5000/api/health

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get dashboard data

### Tutor Endpoints
- `GET /api/tutors/search` - Search tutors
- `GET /api/tutors/:tutorId` - Get tutor details
- `POST /api/tutors/profile` - Create tutor profile
- `GET /api/tutors/profile/me` - Get own tutor profile
- `PUT /api/tutors/profile` - Update tutor profile

### Session Endpoints
- `POST /api/sessions/book` - Book a session
- `GET /api/sessions/my-sessions` - Get user sessions
- `GET /api/sessions/:sessionId` - Get session details
- `PUT /api/sessions/:sessionId/status` - Update session status

### Payment Endpoints
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

## 🔐 Authentication

The application uses JWT-based authentication with role-based access control:

- **Students**: Can book sessions, view their dashboard, and manage payments
- **Tutors**: Can create profiles, manage availability, and handle sessions
- **Admins**: Full access to all features

## 💳 Payment Integration

The platform integrates with Stripe for secure payment processing:

- Credit/Debit card payments
- Automatic platform fee calculation (10%)
- Secure payment intent creation
- Webhook handling for payment status updates
- Refund processing

## 🎨 UI Components

Built with modern design principles using:
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **Radix UI** for accessibility
- **Lucide React** for icons
- **Framer Motion** for animations

## 🚀 Deployment

### Backend Deployment
1. Deploy to platforms like Heroku, Railway, or AWS
2. Set up MongoDB Atlas for production database
3. Configure environment variables
4. Set up Stripe webhooks

### Frontend Deployment
1. Deploy to Vercel, Netlify, or similar platforms
2. Configure build settings
3. Set up environment variables
4. Configure API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Mobile app development with React Native
- AI-powered tutor recommendations
- Video conferencing integration
- Real-time chat system
- Advanced analytics dashboard
- Multi-language support
- Gamification features

---

**MyTutor** - Empowering education through technology! 🎓✨
