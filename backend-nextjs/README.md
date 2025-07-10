# GymRank Next.js Backend

This is the Next.js backend for the GymRank gym ranking platform, converted from the original Flask backend.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Neon PostgreSQL Database
DATABASE_URL=postgresql://neondb_owner:npg_obPs10Bjrvnh@ep-raspy-poetry-a8zd22d9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# File Upload Settings
MAX_FILE_SIZE=50000000
UPLOAD_DIR=./uploads
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### PR Management
- `POST /api/prs/submit` - Submit PRs (with optional video upload)
- `GET /api/leaderboard` - Get leaderboard (with optional gender filter)

### User Management
- `GET /api/users/profile?username=<username>` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams?team=<teamname>` - Get specific team members

### Videos/Posts
- `GET /api/videos` - Get all video posts
- `GET /api/videos?username=<username>` - Get user's videos
- `DELETE /api/videos?id=<id>&username=<username>` - Delete post

### File Upload
- `POST /api/upload` - Upload video files
- `GET /api/uploads/[filename]` - Serve uploaded files

## 🗄️ Database

The application uses PostgreSQL via Neon. The database connection is configured in `src/lib/database.ts`.

## 🔧 Development

### Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   └── uploads/       # File serving route
└── lib/
    ├── database.ts    # Database connection
    ├── types.ts       # TypeScript types
    └── utils.ts       # Utility functions
```

### Building for Production

```bash
npm run build
npm start
```

## 🔀 Migration from Flask

This backend replaces the original Flask backend and provides:

- ✅ Full TypeScript support
- ✅ Modern Next.js App Router
- ✅ PostgreSQL connection pooling
- ✅ File upload handling
- ✅ JWT authentication
- ✅ API validation and error handling
- ✅ DOTS score calculation
- ✅ ELO rating system

## Frontend Integration

The frontend has been updated to use the new API endpoints:
- Base URL changed from `localhost:5000` to `localhost:3000`
- All endpoints updated to match new API structure
- Added success field to API responses
- Token-based authentication support
