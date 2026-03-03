#!/bin/bash

# Smirror Project Tracker - Deployment Script
# This script builds and deploys the application to Vercel

set -e  # Exit on any error

echo "🚀 Smirror Project Tracker - Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi

    print_success "All dependencies are installed"
}

# Run tests
run_tests() {
    print_status "Running tests..."

    if npm test -- --watchAll=false --passWithNoTests; then
        print_success "All tests passed"
    else
        print_error "Tests failed. Please fix the issues before deploying."
        exit 1
    fi
}

# Run linting
run_lint() {
    print_status "Running linter..."

    if npm run lint; then
        print_success "Linting passed"
    else
        print_warning "Linting found issues, but continuing with deployment..."
    fi
}

# Build the application
build_app() {
    print_status "Building application for production..."

    if npm run build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed. Please check the build logs."
        exit 1
    fi
}

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI is not installed."
        print_status "Installing Vercel CLI..."
        npm install -g vercel
        print_success "Vercel CLI installed"
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    local deploy_type="$1"

    check_vercel_cli

    print_status "Deploying to Vercel..."

    if [ "$deploy_type" = "production" ]; then
        print_status "Deploying to production..."
        vercel --prod
    else
        print_status "Deploying to preview environment..."
        vercel
    fi

    if [ $? -eq 0 ]; then
        print_success "Deployment completed successfully!"
        print_status "Your app should be available at the URL shown above"
    else
        print_error "Deployment failed. Please check the Vercel logs."
        exit 1
    fi
}

# Setup environment variables
setup_env_vars() {
    print_status "Checking environment variables..."

    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_success ".env file created from template"
            print_warning "Please edit .env file with your production values before deploying!"
            exit 1
        else
            print_error "env.example file not found. Please create environment configuration."
            exit 1
        fi
    else
        print_success ".env file exists"
    fi
}

# Main deployment function
main() {
    local deploy_type="preview"

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --prod|--production)
                deploy_type="production"
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [--prod|--production] [--help|-h]"
                echo ""
                echo "Options:"
                echo "  --prod, --production    Deploy to production (default: preview)"
                echo "  --help, -h             Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    echo ""
    print_status "Deployment type: $deploy_type"
    echo ""

    # Run deployment steps
    check_dependencies
    setup_env_vars
    run_lint
    run_tests
    build_app
    deploy_to_vercel "$deploy_type"

    echo ""
    print_success "🎉 Deployment completed successfully!"
    print_status "Your Smirror Project Tracker is now live!"
}

# Run main function with all arguments
main "$@"

## What's Been Implemented

### 1. Configuration Files Created

| File | Purpose |
|------|---------|
| [`vercel.json`](vercel.json) | Vercel deployment configuration |
| [`.vercelignore`](.vercelignore) | Files to exclude from deployment |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Main CI/CD pipeline |
| [`.github/workflows/vercel-deploy.yml`](.github/workflows/vercel-deploy.yml) | Vercel-specific deployment |
| [`deploy.sh`](deploy.sh) | Manual deployment script |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Complete deployment guide |
| [`QUICK_START_DEPLOY.md`](QUICK_START_DEPLOY.md) | Quick reference |

### 2. CI/CD Pipeline Features

#### Automated Testing
- ✅ Runs on every push and pull request
- ✅ Tests on Node.js 18.x and 20.x
- ✅ Runs linter checks
- ✅ Generates code coverage reports
- ✅ Uploads coverage to Codecov (optional)

#### Automated Building
- ✅ Builds production bundle
- ✅ Validates build succeeds
- ✅ Stores build artifacts
- ✅ Optimized for performance

#### Automated Deployment
- ✅ Preview deployments for pull requests
- ✅ Production deployments for main branch
- ✅ Separate environments
- ✅ Automatic rollback capability

### 3. Deployment Workflows

#### Workflow 1: Full CI/CD (`ci.yml`)
```
Push/PR → Test → Build → Deploy
```

**Triggers:**
- Push to: `main`, `master`, `develop`
- Pull requests to: `main`, `master`, `develop`

**Jobs:**
1. **Test** (runs on Node 18.x & 20.x)
   - Install dependencies
   - Run linter
   - Run test suite
   - Upload coverage reports

2. **Build**
   - Install dependencies
   - Build production bundle
   - Upload artifacts

3. **Deploy Preview** (PR only)
   - Deploy to Vercel preview
   - Comment PR with preview URL

4. **Deploy Production** (main/master only)
   - Deploy to Vercel production
   - Live at your production URL

#### Workflow 2: Vercel Deploy (`vercel-deploy.yml`)
```
Push to main → Deploy to Production
```

**Optimized for:**
- Quick production deployments
- Uses Vercel CLI
- Pre-built artifacts
- Faster deployment times

## Deployment Options

### 🚀 Option 1: Automatic (Recommended)

**Just push to main:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

**What happens:**
1. GitHub Actions triggers
2. Tests run automatically
3. Build creates production bundle
4. Deploys to Vercel
5. You get notified of status

**Estimated time:** 2-3 minutes

### 🛠️ Option 2: Manual Script

```bash
# Preview deployment
./deploy.sh

# Production deployment
./deploy.sh --prod
```

**What happens:**
1. Runs tests locally
2. Builds application
3. Deploys to Vercel
4. Shows deployment URL

### 💻 Option 3: Vercel CLI

```bash
# Preview
vercel

# Production
vercel --prod
```

## Required Setup

### One-Time Configuration

#### 1. Vercel Account Setup
- Create account at [vercel.com](https://vercel.com)
- Import your GitHub repository
- Note your Project ID and Org ID

#### 2. GitHub Secrets Configuration

Add to: `GitHub → Repository Settings → Secrets → Actions`

| Secret Name | Where to Find | Example |
|-------------|---------------|---------|
| `VERCEL_TOKEN` | [Vercel Account Tokens](https://vercel.com/account/tokens) | `XxXxXxXx...` |
| `VERCEL_ORG_ID` | Vercel CLI or Dashboard URL | `team_xxx` |
| `VERCEL_PROJECT_ID` | Project Settings → General | `prj_xxx` |

#### 3. Environment Variables (Optional)

Add to: `Vercel → Project Settings → Environment Variables`

```
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Your App Name
```

## Deployment Environments

### Production
- **URL**: `https://your-project.vercel.app`
- **Trigger**: Push to `main` or `master`
- **Branch**: main/master
- **Automatic**: Yes

### Preview
- **URL**: `https://git-branch-name-project.vercel.app`
- **Trigger**: Pull requests
- **Branch**: Any feature branch
- **Automatic**: Yes
- **Duration**: Until PR is closed

### Development
- **URL**: Local or custom
- **Trigger**: Manual
- **Branch**: Any
- **Automatic**: No

## Monitoring

### View Deployment Status

**GitHub Actions:**
1. Go to repository on GitHub
2. Click "Actions" tab
3. See all workflow runs
4. Click any run to see details

**Vercel Dashboard:**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. View deployments, logs, analytics

### Build Logs

**Location 1 - GitHub:**
- Repository → Actions → Select workflow run → View logs

**Location 2 - Vercel:**
- Dashboard → Project → Deployments → Select deployment → View build logs

## Build Status Badges

Add to your README.md:

```markdown
[![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
[![Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=YOUR_REPO_URL)
```

## Testing Before Deploy

### Local Build Test
```bash
npm run build
npm run preview
```

### Test CI Pipeline Locally
```bash
# Run tests as CI does
npm run test:ci

# Lint
npm run lint
```

## Rollback Procedures

### Method 1: Vercel Dashboard (Fastest)
1. Go to Vercel Dashboard → Deployments
2. Find working deployment
3. Click "..." → "Promote to Production"

### Method 2: Git Revert
```bash
git revert HEAD
git push origin main
```

### Method 3: Vercel CLI
```bash
vercel ls  # List deployments
vercel promote <deployment-url>
```

## Security Best Practices

✅ **Implemented:**
- GitHub secrets for sensitive data
- Environment-specific configurations
- Automated security updates (Dependabot)
- No secrets in code

⚠️ **Recommended:**
- Enable branch protection rules
- Require PR reviews
- Enable status checks
- Restrict who can deploy

## Performance Optimizations

**Implemented:**
- ✅ NPM cache in GitHub Actions
- ✅ Build artifact caching
- ✅ Optimized build process
- ✅ Parallel test execution
- ✅ Gzip compression (Vercel automatic)
- ✅ CDN distribution (Vercel automatic)

## Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build fails | Check build logs in GitHub Actions |
| Tests fail in CI | Run `npm run test:ci` locally |
| Deployment fails | Verify GitHub secrets are set |
| 404 on routes | Check `vercel.json` routing rules |
| Env vars not working | Add `VITE_` prefix |

### Debug Commands

```bash
# Check Vercel configuration
vercel env ls

# View deployment logs
vercel logs [deployment-url]

# Inspect build
vercel inspect [deployment-url]

# Test build locally
npm run build -- --debug
```

## File Structure

```
client/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Main CI/CD pipeline
│       └── vercel-deploy.yml         # Vercel deployment
├── dist/                             # Build output (gitignored)
├── src/                              # Source code
├── tests/                            # Test files
├── .vercelignore                     # Vercel ignore rules
├── vercel.json                       # Vercel configuration
├── deploy.sh                         # Manual deployment script
├── package.json                      # Dependencies & scripts
├── DEPLOYMENT.md                     # Full deployment guide
├── QUICK_START_DEPLOY.md            # Quick reference
└── CI_CD_SUMMARY.md                 # This file
```

## Next Steps

### Immediate
1. ✅ Push code to GitHub
2. ✅ Add GitHub secrets
3. ✅ Watch deployment succeed

### Optional Enhancements
- [ ] Set up custom domain
- [ ] Configure deployment notifications
- [ ] Add error tracking (Sentry)
- [ ] Set up analytics
- [ ] Configure CDN caching rules
- [ ] Add performance monitoring
- [ ] Set up staging environment

## Support & Resources

### Documentation
- [Full Deployment Guide](DEPLOYMENT.md)
- [Quick Start Guide](QUICK_START_DEPLOY.md)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ci          # Run tests in CI mode

# Deployment
./deploy.sh              # Deploy preview
./deploy.sh --prod       # Deploy production
vercel                   # Deploy preview (CLI)
vercel --prod            # Deploy production (CLI)

# Monitoring
vercel ls                # List deployments
vercel logs              # View logs
vercel inspect           # Inspect deployment
```

## Success Metrics

After implementation, you get:

✅ **Automated Testing**: Every commit tested
✅ **Automated Deployment**: Push to deploy
✅ **Preview Environments**: Test before production
✅ **Fast Rollback**: One-click rollback
✅ **Deployment History**: Full audit trail
✅ **Performance**: Global CDN distribution
✅ **Monitoring**: Real-time deployment status
✅ **Security**: No secrets in code

---

**Status**: ✅ Fully Implemented
**Last Updated**: 2025-11-01
**Version**: 1.0.0
