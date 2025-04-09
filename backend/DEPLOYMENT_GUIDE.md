# Deploying to Vercel - Step by Step Guide

## Prerequisites

1. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install using `npm i -g vercel`
3. **MongoDB Atlas**: Ensure your MongoDB database is accessible from Vercel's servers

## Preparation Steps

1. **Update CORS Configuration**
   
   In `server.js`, ensure your CORS settings include your production frontend domain:
   ```javascript
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? ['https://your-frontend-domain.vercel.app', 'http://localhost:3000', 'http://localhost:3001']
       : ['http://localhost:3000', 'http://localhost:3001'],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```
   
   Replace `'https://your-frontend-domain.vercel.app'` with your actual frontend URL after deployment.

2. **Verify MongoDB Connection**
   
   Ensure your MongoDB connection string is using Atlas or another cloud provider, not localhost.

## Deployment Process

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

2. **Initialize Deployment**
   ```
   vercel
   ```
   
   Follow the interactive prompts:
   - Set up and deploy "backend"? Yes
   - Which scope do you want to deploy to? [Select your account]
   - Link to existing project? No
   - What's your project's name? [coworking-space-api]
   - In which directory is your code located? ./
   - Want to override the settings? No
   
3. **Set Environment Variables**
   
   After initial deployment, go to the Vercel dashboard:
   - Select your project
   - Go to "Settings" > "Environment Variables"
   - Add all required variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret key
     - `JWT_EXPIRE`: JWT token expiration (e.g., 30d)
     - `JWT_COOKIE_EXPIRE`: Cookie expiration in days
     - `NODE_ENV`: Set to "production"

4. **Production Deployment**
   ```
   vercel --prod
   ```

## Connecting Frontend to Backend

1. In your frontend application, update the API base URL to point to your Vercel deployment:
   ```javascript
   const API_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-backend-url.vercel.app/api/v1'
     : 'http://localhost:5003/api/v1';
   ```

2. Ensure your frontend is sending credentials with requests:
   ```javascript
   axios.defaults.withCredentials = true;
   ```

## Troubleshooting

1. **CORS Issues**
   - Verify that your backend CORS settings include your frontend domain
   - Check that credentials are being sent with requests

2. **Environment Variables**
   - Confirm all environment variables are set correctly in Vercel
   - Check for typos or missing variables

3. **MongoDB Connection**
   - Ensure your MongoDB instance is accessible from Vercel's servers
   - Check that your connection string is correct
   
4. **Deployment Logs**
   - Check deployment logs in Vercel dashboard for errors
   - Use `vercel logs` command to view logs

## Maintenance

1. **Updating Your Deployment**
   - Make changes to your code
   - Run `vercel` to preview changes
   - Run `vercel --prod` to update production

2. **Monitoring**
   - Use Vercel dashboard to monitor your application
   - Set up alerts for errors or performance issues 