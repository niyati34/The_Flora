# Deployment Guide for The Flora

## Quick Vercel Deployment

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to app directory
cd app

# Login to Vercel (first time only)
vercel login

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Root Directory**: `app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click "Deploy"

## Build Configuration

The project is already configured for optimal Vercel deployment:

- ✅ `vercel.json` configuration file
- ✅ Optimized Vite build settings
- ✅ SPA routing setup
- ✅ Asset optimization

## Environment Setup

No environment variables are required for the current implementation.

## Post-Deployment

After deployment:
1. Test all routes work correctly
2. Verify images load properly
3. Test plant scanner functionality
4. Ensure customer support chat works

## Troubleshooting

**404 on page refresh**: Already handled by `vercel.json` routing config
**Images not loading**: All images moved to `app/public/` directory
**Build failures**: Check Node.js version (requires 18+)

## Performance

The app includes:
- Code splitting for vendor and router bundles
- Lazy image loading
- Minified production builds
- Optimized asset delivery
