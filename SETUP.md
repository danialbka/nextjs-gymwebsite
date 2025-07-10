# GymRank Setup Guide

## 🚀 Quick Setup

### 1. Backend Setup (Port 3001)
```bash
cd backend-nextjs

# Install dependencies
npm install

# Configure environment variables
# Edit .env.local and update DATABASE_URL with your NeonDB connection
# Required configuration:
# - DATABASE_URL=postgresql://username:password@host/database?sslmode=require
# - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Initialize database schema
npm run db:setup

# Start backend
npm run dev
```

### 2. Frontend Setup (Port 3000)
```bash
cd frontend-nextjs
npm install
npm run dev
```

## 🔧 Configuration

### Backend (Port 3001)
- Configured with CORS to allow requests from `http://localhost:3000`
- All API routes available at `http://localhost:3001/api/*`

### Frontend (Port 3000)
- Configured to proxy API requests to `http://localhost:3001`
- UI available at `http://localhost:3000`

## 📋 Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Make sure backend is running on port 3001
2. Make sure frontend is running on port 3000
3. Restart both servers after configuration changes

### Network Errors
- Verify backend is running: `curl http://localhost:3001/api/health`
- Check frontend proxy configuration in `.env.local`

### 500 Internal Server Error
- Check backend environment variables in `.env.local`
- Ensure DATABASE_URL is correctly configured
- Ensure JWT_SECRET is set
- Check backend console for detailed error messages

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/*
- **Backend Health**: http://localhost:3001/api/health (if available)

## 🔑 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend
Configure your database and other environment variables as needed.