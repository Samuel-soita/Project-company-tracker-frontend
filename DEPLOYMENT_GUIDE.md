# 🚀 Company Project Manager - Deployment Guide

## Overview

Your **Company Project Manager** is now production-ready and can be deployed to Vercel with a single command. This guide walks you through the deployment process.

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ **Backend Deployed**: Your backend must be running and accessible
2. ✅ **Environment Variables**: Configure your production API URL
3. ✅ **Vercel Account**: Free account at [vercel.com](https://vercel.com)
4. ✅ **Git Repository**: Code pushed to GitHub/GitLab/Bitbucket

## ⚡ Quick Deployment (Recommended)

### Option 1: One-Command Deploy

```bash
# Clone and deploy in one go
git clone <your-repo-url>
cd company-project-manager
cp env.example .env
# Edit .env with your production API URL
./deploy.sh --prod
```

### Option 2: Manual Vercel Deploy

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy to production
vercel --prod

# Or deploy to preview first
vercel
```

## 🔧 Environment Setup

### 1. Create Environment File

```bash
cp env.example .env
```

### 2. Configure Production Variables

Edit `.env` file:

```bash
# Change this to your production backend URL
VITE_API_URL=https://your-backend-api.com

# Update app name (optional)
VITE_APP_NAME="Your Company Project Manager"

# Keep other defaults
VITE_NODE_ENV=production
```

### 3. Vercel Environment Variables

For production, set environment variables in Vercel dashboard:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   VITE_API_URL=https://your-production-backend.com
   VITE_APP_NAME=Your Company Project Manager
   ```

## 🏗️ Deployment Steps

### Step 1: Prepare Your Code

```bash
# Ensure you're on main branch
git checkout main

# Pull latest changes
git pull origin main

# Copy and configure environment
cp env.example .env
# Edit .env with production values
```

### Step 2: Test Locally (Optional but Recommended)

```bash
# Test the build locally
npm run build
npm run preview

# Open http://localhost:4173 to test
```

### Step 3: Deploy

#### Method A: Using Deploy Script (Recommended)

```bash
# Deploy to production
./deploy.sh --prod

# Or deploy to preview first
./deploy.sh
```

#### Method B: Direct Vercel CLI

```bash
# Login to Vercel (first time only)
vercel login

# Link project (first time only)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Method C: GitHub Integration (Automatic)

1. **Connect Repository**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Vercel auto-detects settings

2. **Configure Environment**:
   - Add environment variables in Vercel dashboard
   - Set `VITE_API_URL` to your production backend

3. **Automatic Deployments**:
   - Push to `main` → Production deploy
   - Push to feature branches → Preview deploy

## 🌐 Custom Domain (Optional)

### 1. Add Custom Domain in Vercel

1. Go to **Project Settings** → **Domains**
2. Add your domain (e.g., `projects.yourcompany.com`)
3. Follow DNS configuration instructions

### 2. Update CORS in Backend

Ensure your backend allows the custom domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',  // Development
    'https://yourcompany.vercel.app',  // Vercel default
    'https://projects.yourcompany.com'  // Custom domain
  ],
  credentials: true
}));
```

## 🔍 Testing Your Deployment

### 1. Basic Functionality Test

```bash
# Test the deployed URL
curl https://your-app.vercel.app

# Should return HTML content
```

### 2. End-to-End Test

1. **Visit deployed URL**
2. **Try logging in** with test credentials
3. **Create a project** (if backend is connected)
4. **Test responsive design** on mobile

### 3. API Connectivity Test

```bash
# Test backend connection
curl -X POST https://your-app.vercel.app/api/health
# Should not get CORS errors
```

## 🐛 Troubleshooting

### Common Issues

#### Issue: Build Fails
```bash
# Test build locally first
npm run build

# Check for missing dependencies
npm install

# Check environment variables
cat .env
```

#### Issue: CORS Errors
- ✅ Backend must allow Vercel domain
- ✅ Backend must have `credentials: true`
- ✅ Check `VITE_API_URL` is correct

#### Issue: 404 on Refresh
- ✅ `vercel.json` handles client-side routing
- ✅ Check build output has correct files

#### Issue: Environment Variables Not Working
```bash
# In Vercel dashboard, ensure variables start with VITE_
# VITE_API_URL=https://api.yourcompany.com ✅
# API_URL=https://api.yourcompany.com ❌
```

### Vercel Logs

```bash
# View deployment logs
vercel logs

# View specific deployment
vercel logs [deployment-url]
```

### Rollback

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [previous-deployment-url]
```

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Go to **Project** → **Analytics**
2. Monitor performance, errors, and usage

### Error Tracking (Recommended)

Add Sentry for error monitoring:

```bash
# Install Sentry
npm install @sentry/react @sentry/tracing

# Configure in main.jsx
import * as Sentry from "@sentry/react";
Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.VITE_NODE_ENV,
});
```

### Performance Monitoring

Vercel provides built-in performance monitoring:
- Core Web Vitals
- Function execution times
- Bandwidth usage

## 🔒 Security Checklist

- ✅ **HTTPS enabled** (automatic on Vercel)
- ✅ **Secure headers** (Vercel automatic)
- ✅ **Environment variables** protected
- ✅ **No secrets in code**
- ✅ **CORS properly configured**

## 🎯 Post-Deployment Tasks

1. **Update DNS** (if using custom domain)
2. **Test all user flows** (login, create project, kanban board)
3. **Set up monitoring** (Sentry, Vercel Analytics)
4. **Configure backups** (if needed)
5. **Document for team** (login credentials, API endpoints)

## 📞 Support

### Vercel Resources
- [Vercel Documentation](https://vercel.com/docs)
- [CLI Reference](https://vercel.com/docs/cli)
- [Community Forum](https://vercel.com/discord)

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Deployment
./deploy.sh             # Deploy to preview
./deploy.sh --prod      # Deploy to production
vercel ls               # List deployments
vercel logs             # View logs

# Environment
vercel env ls           # List environment variables
vercel env add          # Add environment variable
```

## 🎉 Success!

Once deployed, your **Company Project Manager** will be available at:
- **Preview**: `https://[project-name].vercel.app`
- **Production**: `https://[project-name].vercel.app` (or custom domain)

**Your enterprise-grade project management system is now live! 🚀**

---

*Need help? Check the logs with `vercel logs` or visit the [Vercel Discord](https://vercel.com/discord) for community support.*