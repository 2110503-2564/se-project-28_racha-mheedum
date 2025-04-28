[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/0SExP_Tj)

# Co-working Space API

Backend API for a co-working space reservation system.

## Deploying to Vercel

1. **Prepare your project**
   - Ensure you have a Vercel account
   - Install Vercel CLI: `npm i -g vercel`

2. **Set up Environment Variables**
   - In the Vercel dashboard, add the following environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Secret for JWT token encryption
     - `JWT_EXPIRE`: JWT token expiration (e.g., 30d)
     - `JWT_COOKIE_EXPIRE`: Cookie expiration in days
     - `NODE_ENV`: Set to "production"

3. **Deploy**
   - Run `vercel login` in your terminal
   - Navigate to the backend directory
   - Run `vercel` to deploy
   - For production deployment, use `vercel --prod`

4. **Update Frontend Configuration**
   - Update your frontend API base URL to point to your new Vercel deployment URL
   - Update CORS settings in `server.js` with your frontend domain

## API Routes

The API includes endpoints for:
- Authentication (/api/v1/auth)
- Reservations (/api/v1/reservations)
- Co-working Spaces (/api/v1/coworking-spaces)

## Local Development

1. Install dependencies: `npm install`
2. Create a `config/config.env` file with the necessary environment variables
3. Run the server: `npm run dev`
