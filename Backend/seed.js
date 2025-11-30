const mongoose = require('mongoose');
const User = require('./models/User');
const Tutor = require('./models/Tutor');
require('dotenv').config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.DATABASE_URL;
        if (!uri) {
            throw new Error('Missing MONGO_URI/DATABASE_URL environment variable');
        }

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected for seeding          ');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

const seedTutors = async () => {
    try {
        console.log('Seeding test tutors...');

        // Clear existing test data
        await User.deleteMany({ email: { $regex: /^test/ } });
        await Tutor.deleteMany({ user: { $in: await User.find({ email: { $regex: /^test/ } }).distinct('_id') } });

        // Create test users and tutors
        const testTutors = [
            {
                user: {
                    name: 'John Smith',
                    email: 'test.tutor1@example.com',
                    password: 'password123',
                    role: 'tutor'
                },
                tutor: {
                    fullName: 'John Smith',
                    bio: 'Experienced math tutor with 5 years of teaching experience.',
                    location: {
                        city: 'New York',
                        country: 'USA'
                    },
                    subjects: [
                        {
                            subject: 'Mathematics',
                            level: 'intermediate',
                            hourlyRate: 30
                        },
                        {
                            subject: 'Physics',
                            level: 'advanced',
                            hourlyRate: 35
                        }
                    ],
                    qualifications: [
                        {
                            degree: 'M.Sc. Mathematics',
                            institution: 'NYU',
                            year: 2018
                        }
                    ],
                    experience: {
                        years: 5,
                        description: 'Teaching mathematics and physics to high school and college students.'
                    },
                    languages: ['English', 'Spanish'],
                    hourlyRate: 30,
                    availability: {
                        generalAvailability: 'Weekdays 6-9 PM, Weekends 10 AM - 5 PM',
                        timezone: 'EST'
                    },
                    isProfileComplete: true,
                    isAvailable: true,
                    isVerified: true
                }
            },
            {
                user: {
                    name: 'Sarah Johnson',
                    email: 'test.tutor2@example.com',
                    password: 'password123',
                    role: 'tutor'
                },
                tutor: {
                    fullName: 'Sarah Johnson',
                    bio: 'Passionate English literature tutor helping students excel in reading and writing.',
                    location: {
                        city: 'London',
                        country: 'UK'
                    },
                    subjects: [
                        {
                            subject: 'English Literature',
                            level: 'beginner',
                            hourlyRate: 25
                        },
                        {
                            subject: 'Writing',
                            level: 'intermediate',
                            hourlyRate: 28
                        }
                    ],
                    qualifications: [
                        {
                            degree: 'B.A. English Literature',
                            institution: 'University of London',
                            year: 2019
                        }
                    ],
                    experience: {
                        years: 3,
                        description: 'Teaching English literature and writing skills to students of all levels.'
                    },
                    languages: ['English'],
                    hourlyRate: 25,
                    availability: {
                        generalAvailability: 'Monday-Friday 5-8 PM',
                        timezone: 'GMT'
                    },
                    isProfileComplete: true,
                    isAvailable: true,
                    isVerified: true
                }
            },
            {
                user: {
                    name: 'Dr. Michael Chen',
                    email: 'test.tutor3@example.com',
                    password: 'password123',
                    role: 'tutor'
                },
                tutor: {
                    fullName: 'Dr. Michael Chen',
                    bio: 'PhD in Computer Science with extensive experience in programming and algorithms.',
                    location: {
                        city: 'San Francisco',
                        country: 'USA'
                    },
                    subjects: [
                        {
                            subject: 'Computer Science',
                            level: 'advanced',
                            hourlyRate: 50
                        },
                        {
                            subject: 'Python',
                            level: 'intermediate',
                            hourlyRate: 40
                        },
                        {
                            subject: 'JavaScript',
                            level: 'beginner',
                            hourlyRate: 35
                        }
                    ],
                    qualifications: [
                        {
                            degree: 'PhD Computer Science',
                            institution: 'Stanford University',
                            year: 2015
                        }
                    ],
                    experience: {
                        years: 8,
                        description: 'Teaching computer science, programming, and algorithms to university students.'
                    },
                    languages: ['English', 'Mandarin'],
                    hourlyRate: 40,
                    availability: {
                        generalAvailability: 'Flexible hours, primarily evenings and weekends',
                        timezone: 'PST'
                    },
                    isProfileComplete: true,
                    isAvailable: true,
                    isVerified: true
                }
            }
        ];

        for (const testData of testTutors) {
            // Create user
            const user = new User(testData.user);
            await user.save();

            // Create tutor profile
            const tutor = new Tutor({
                ...testData.tutor,
                user: user._id
            });
            await tutor.save();

            console.log(`Created tutor: ${tutor.fullName}`);
        }

        console.log('Seeding completed successfully!');
        console.log('Test tutors created:');
        console.log('- John Smith (Mathematics, Physics)');
        console.log('- Sarah Johnson (English Literature, Writing)');
        console.log('- Dr. Michael Chen (Computer Science, Python, JavaScript)');

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the seed function
connectDB().then(() => {
    seedTutors();
});
