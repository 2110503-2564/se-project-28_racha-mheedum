# Co-working Space Frontend

This is the frontend application for the Co-working Space Reservation System.

## Backend Connection

This frontend is configured to connect to the backend at: https://2-fe-backend.vercel.app/api/v1

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Setup

- `.env.development` - Development environment (local development)
- `.env.production` - Production environment (for deployment)

## Deployment to Vercel

### Prerequisites

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm install -g vercel`

### Deployment Steps

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   Follow the prompts to complete the deployment.

3. **Environment Variables**:
   Make sure to set the following environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: Set to `https://2-fe-backend.vercel.app/api/v1`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API Key

4. **Production Deployment**:
   ```bash
   vercel --prod
   ```

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - Reusable UI components
- `/src/contexts` - React context providers
- `/src/lib` - Utility functions and API client

## Features

- Authentication (login, register, logout)
- Co-working space browsing and search
- Reservation creation and management
- Admin panel for administrators
- Interactive maps for location selection
