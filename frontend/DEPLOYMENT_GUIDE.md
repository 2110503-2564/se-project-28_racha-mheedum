# Frontend Deployment Guide

This guide provides step-by-step instructions for deploying the Co-working Space Reservation frontend to Vercel.

## Prerequisites

1. **Vercel Account**: Create an account at [vercel.com](https://vercel.com) if you don't already have one.
2. **Vercel CLI**: Install using `npm i -g vercel`
3. **Google Maps API Key**: For the map functionality, you need a valid Google Maps API key with the following APIs enabled:
   - Maps JavaScript API
   - Places API
   - Geocoding API

## Configuration

The frontend is already configured to connect to the backend at:
```
https://2-fe-backend.vercel.app/api/v1
```

### Environment Files

1. **Development Environment** (`.env.development`):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5003/api/v1
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
   ```

2. **Production Environment** (`.env.production`):
   ```
   NEXT_PUBLIC_API_URL=https://2-fe-backend.vercel.app/api/v1
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
   ```

## Deployment Steps

### Method 1: Using the Deployment Helper Script

1. Run the deployment script:
   ```
   npm run deploy
   ```
   
2. Follow the interactive prompts.

### Method 2: Manual Deployment

1. **Login to Vercel**
   ```
   vercel login
   ```

2. **Deploy to Vercel**
   ```
   vercel
   ```
   
   Follow the interactive prompts:
   - Set up and deploy? Yes
   - Select your scope
   - Link to existing project? No
   - Choose a project name
   - In which directory is your code located? ./
   - Want to override the settings? No
   
3. **Set Environment Variables**
   
   After initial deployment, go to the Vercel dashboard:
   - Select your project
   - Go to "Settings" > "Environment Variables"
   - Add all required variables:
     - `NEXT_PUBLIC_API_URL`: Set to `https://2-fe-backend.vercel.app/api/v1`
     - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key

4. **Production Deployment**
   ```
   vercel --prod
   ```

## Troubleshooting

1. **API Connection Issues**
   - Verify that the backend is accessible at `https://2-fe-backend.vercel.app/api/v1/test`
   - Check that CORS is properly configured in both frontend and backend
   - Ensure credentials are being sent with requests

2. **Map Functionality Issues**
   - Verify that your Google Maps API key is correctly set in Vercel
   - Check that all required Google APIs are enabled for your key
   - Look for errors in the browser console

3. **Authentication Problems**
   - Clear local storage in the browser if you encounter persistent auth issues
   - Check that the backend auth endpoints are working correctly

4. **Deployment Errors**
   - Check Vercel build logs for any errors during the build process
   - Ensure all dependencies are correctly installed
   - Verify that the Node.js version matches requirements

## Post-Deployment

After successfully deploying your frontend:

1. **Testing**: Thoroughly test all features on the live site
2. **Browser Compatibility**: Check the site in different browsers
3. **Mobile Responsiveness**: Test on various device sizes
4. **Performance**: Run a Lighthouse test to identify potential performance issues 