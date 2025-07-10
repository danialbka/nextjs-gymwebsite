# NextJS GymWebsite 🏋️‍♂️

A modern gym ranking application built with Next.js, featuring user authentication, personal record tracking, and video proof submission via social media links.

## ✨ Features

- 🔐 **Secure Authentication** with JWT tokens and rate limiting
- 📊 **Personal Records (PRs)** tracking for bench, squat, and deadlift
- 🎥 **Video Proof** via Instagram, YouTube, TikTok, and Twitter links
- 🏆 **ELO Rating System** and DOTS score calculation
- 👥 **Team Management** and leaderboards
- 🛡️ **Security Features** including rate limiting and input validation
- 📱 **Responsive Design** with Tailwind CSS and Radix UI

## 🚀 Tech Stack

### Backend
- **Next.js 15** (App Router)
- **PostgreSQL** with NeonDB
- **JWT Authentication**
- **TypeScript**
- **bcryptjs** for password hashing

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Radix UI** components
- **Lucide Icons**

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- NeonDB account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nextjs-gymwebsite.git
   cd nextjs-gymwebsite
   ```

2. **Backend Setup**
   ```bash
   cd backend-nextjs
   npm install
   
   # Configure environment variables
   cp .env.example .env.local
   # Edit .env.local with your NeonDB connection string
   
   # Initialize database
   npm run db:setup
   
   # Start backend (port 3001)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend-nextjs
   npm install
   
   # Start frontend (port 3000)
   npm run dev
   ```

4. **Database Setup**
   - Copy contents of `fresh-db-setup.sql` into your NeonDB console
   - Run the SQL to create tables and sample data

## 🔧 Environment Variables

### Backend (.env.local)
```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MAX_FILE_SIZE=50000000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users/profile?username=user` - Get user profile
- `PUT /api/users/profile` - Update user profile (authenticated)

### Personal Records
- `POST /api/prs/submit` - Submit new PR (authenticated)

### Other
- `GET /api/leaderboard` - Get user rankings
- `GET /api/teams` - Get team information
- `GET /api/videos` - Get recent videos

## 🎥 Supported Video Platforms

- Instagram (posts, reels, IGTV)
- YouTube
- TikTok
- Twitter/X
- Direct video file URLs

## 🏆 Scoring Systems

- **ELO Rating**: Based on total weight lifted
- **DOTS Score**: Standardized powerlifting scoring system accounting for body weight and gender

## 🛡️ Security Features

- JWT token authentication
- Rate limiting (5 login attempts per 15 minutes)
- Input validation and sanitization
- SQL injection protection
- CORS configuration
- Password hashing with bcrypt

## 📁 Project Structure

```
├── backend-nextjs/          # Next.js backend API
│   ├── src/
│   │   ├── app/api/         # API routes
│   │   ├── lib/             # Utilities and database
│   │   └── scripts/         # Database scripts
│   └── package.json
├── frontend-nextjs/         # Next.js frontend
│   ├── src/
│   │   ├── app/             # Pages and layouts
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   └── lib/             # Frontend utilities
│   └── package.json
├── schema.sql              # Database schema
├── fresh-db-setup.sql      # Fresh database setup with sample data
└── README.md
```

## 🔄 Development Workflow

1. **Start both servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend-nextjs && npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend-nextjs && npm run dev
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## 📊 Sample Data

The fresh database setup includes:
- User: `danialbka2` (password: use your original or `password123`)
- Sample PRs with video links
- Test users for development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📜 License

MIT License - feel free to use this project for learning and development.

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure your NeonDB connection string is correct
- Check that SSL is enabled in the connection string
- Run `npm run db:setup` to initialize tables

### CORS Issues
- Verify backend is running on port 3001
- Check frontend proxy configuration
- Ensure both servers are running

### Authentication Issues
- Check JWT_SECRET is set
- Verify token is being sent in Authorization header
- Check rate limiting hasn't been triggered

## 🎯 Future Enhancements

- [ ] Real-time leaderboard updates
- [ ] Social features (following, comments)
- [ ] Advanced analytics and progress tracking
- [ ] Mobile app with React Native
- [ ] Integration with fitness tracking APIs
- [ ] Video analysis and form checking