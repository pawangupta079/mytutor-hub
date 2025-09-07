# Backend App

## Overview
This project is a backend application designed to manage user-related functionalities for a tutoring platform. It includes features for user registration, login, and profile management.

## Project Structure
```
backend-app
├── server.js
├── .env
├── package.json
├── config
│   └── db.js
├── models
│   └── User.js
├── routes
│   └── userRoutes.js
├── controllers
│   └── userController.js
├── middlewares
│   └── authMiddleware.js
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd backend-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Environment Variables
Create a `.env` file in the root directory and add the following variables:
```
DATABASE_URL=<your-database-url>
JWT_SECRET=<your-jwt-secret>
```

## Usage
To start the server, run:
```
node server.js
```

## API Endpoints
- **POST /api/users/register**: Register a new user.
- **POST /api/users/login**: Log in an existing user.
- **GET /api/users/profile**: Get the profile of the logged-in user.

## Contributing
Feel free to submit issues or pull requests for any improvements or bug fixes.