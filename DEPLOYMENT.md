# MYTUTOR-HUB Deployment Guide

This guide explains how to deploy the MYTUTOR-HUB application to Vercel.

## Project Structure

- **Backend**: Node.js/Express API server with MongoDB
- **Frontend**: React SPA built with Vite

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Database**: Set up a MongoDB database (MongoDB Atlas recommended)
3. **Git Repository**: Push your code to GitHub/GitLab

## Environment Variables

### Backend Environment Variables (Set in Vercel Dashboard)

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mytutor
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend Environment Variables (Set in Vercel Dashboard)

```
VITE_API_URL=https://your-backend-url.vercel.app/api
VITE_APP_NAME=MyTutor
VITE_APP_VERSION=1.0.0
```

## Deployment Steps

### 1. Deploy Backend

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: Backend
   - **Build Command**: npm run build (if needed)
   - **Output Directory**: (leave empty)
5. Add environment variables in the "Environment Variables" section
6. Click "Deploy"

### 2. Deploy Frontend

1. In Vercel dashboard, click "New Project"
2. Import the same Git repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: Frontend
   - **Build Command**: npm run build
   - **Output Directory**: dist
4. Add environment variables (especially VITE_API_URL pointing to your backend URL)
5. Click "Deploy"

### 3. Update Frontend Environment

After deploying the backend, update the frontend's `VITE_API_URL` environment variable with the actual backend URL from Vercel.

## Database Setup

1. Create a MongoDB Atlas cluster or use your preferred MongoDB provider
2. Get the connection string
3. Set the `MONGO_URI` environment variable in the backend deployment

## Testing the Deployment

1. **Backend**: Visit `https://your-backend-url.vercel.app/api/users/test` (if you have a test endpoint)
2. **Frontend**: Visit `https://your-frontend-url.vercel.app`
3. Test user registration, login, and tutor search functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` is set correctly in backend
2. **API Connection**: Verify `VITE_API_URL` points to the correct backend URL
3. **Database Connection**: Check `MONGO_URI` is correct and accessible
4. **Build Failures**: Ensure all dependencies are in package.json

### Logs

Check Vercel deployment logs for detailed error information.

## Post-Deployment

1. **Seed Database**: Run the seed script to add test data:
   ```bash
   cd Backend
   node seed.js
   ```

2. **Domain Setup**: Configure custom domains if needed

3. **Monitoring**: Set up monitoring and error tracking

## Security Notes

- Never commit sensitive environment variables to Git
- Use strong JWT secrets
- Regularly update dependencies
- Implement rate limiting for production

## Support

If you encounter issues, check:
- Vercel deployment logs
- MongoDB connection status
- Environment variable configuration
- Network connectivity between frontend and backend
