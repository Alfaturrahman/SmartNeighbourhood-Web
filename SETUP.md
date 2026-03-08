# Environment Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or higher) - [Download](https://nodejs.org/)
- **npm** (v10.x or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

## Installation Steps

### 1. Clone or Download Project

If using Git:
```bash
git clone <repository-url>
cd smartneighbour
```

Or download and extract the ZIP file.

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Axios
- SweetAlert2
- and more...

### 3. Environment Variables Setup

Create a `.env.local` file in the root directory:

```bash
# On Windows (PowerShell)
Copy-Item .env.example .env.local

# On Linux/Mac
cp .env.example .env.local
```

Edit `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# App Configuration
NEXT_PUBLIC_APP_NAME="Smart Neighborhood"
NEXT_PUBLIC_APP_VERSION=1.0.0

# Environment
NODE_ENV=development
```

**Important Notes:**
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Never commit `.env.local` to Git (already in .gitignore)
- For production, set these in your hosting platform

### 4. Verify Installation

Check if everything is installed correctly:

```bash
# Check Node version
node --version
# Should output: v20.x.x or higher

# Check npm version
npm --version
# Should output: v10.x.x or higher

# Check if dependencies are installed
npm list --depth=0
```

### 5. Run Development Server

```bash
npm run dev
```

The application should now be running at:
- **Local:** http://localhost:3000
- **Network:** http://[your-ip]:3000

### 6. Verify It's Working

Open your browser and navigate to `http://localhost:3000`

You should see:
- ✅ Landing page with features grid
- ✅ No console errors
- ✅ Responsive design working

## Different Environments

### Development

```bash
npm run dev
```

Features:
- Hot reload
- Detailed error messages
- Source maps
- Development tools

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

Production optimizations:
- Minified code
- Optimized images
- Static generation
- Service worker caching

### Type Checking

```bash
npm run type-check
```

This runs TypeScript compiler without emitting files to check for type errors.

### Linting

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | "Smart Neighborhood" |
| `NEXT_PUBLIC_APP_VERSION` | App version | "1.0.0" |
| `NODE_ENV` | Environment mode | "development" |

## Backend API Setup

This frontend connects to a backend API. Make sure:

1. **Backend is running** at the URL specified in `NEXT_PUBLIC_API_URL`
2. **CORS is configured** to allow requests from `http://localhost:3000`
3. **API endpoints** match the ones in `API.md`

### Testing Without Backend

The app currently uses dummy data, so you can:
- Test all UI features
- Navigate between pages
- Test forms and interactions
- See how the app works

To connect to real API:
1. Set `NEXT_PUBLIC_API_URL` to your backend URL
2. Update service files to use API calls instead of dummy data
3. Ensure backend returns data in expected format

## Troubleshooting

### Port 3000 Already in Use

```bash
# Use different port
PORT=3001 npm run dev
```

Or kill the process using port 3000:

**Windows:**
```powershell
# Find process
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Cache Issues

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P > "TypeScript: Restart TS Server"

# Or run type check
npm run type-check
```

### Service Worker Issues

Clear service worker cache:
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers"
4. Click "Unregister"
5. Refresh page

## IDE Setup

### VS Code (Recommended)

Install these extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Performance Optimization

### For Development

```bash
# Use SWC compiler (faster than Babel)
# Already enabled in Next.js 16

# Disable source maps for faster builds
# Add to next.config.ts:
# productionBrowserSourceMaps: false
```

### For Production

```bash
# Analyze bundle size
npm run build

# Check the output for:
# - Route sizes
# - First Load JS size
# - Shared chunks
```

## Database Setup (Future)

When connecting to a database:
1. Add database URL to `.env.local`
2. Install database client (e.g., Prisma, Mongoose)
3. Run migrations
4. Seed data if needed

## Deployment Checklist

Before deploying:
- [ ] Set all environment variables in hosting platform
- [ ] Update `NEXT_PUBLIC_API_URL` to production API
- [ ] Run `npm run build` successfully
- [ ] Test production build locally
- [ ] Check for console errors
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Update CORS settings on backend

## Need Help?

- Check the [README.md](README.md) for general information
- See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Review [API.md](API.md) for API documentation
- Open an issue on GitHub

---

**Happy Developing! 🚀**
