# GymRank Frontend (Next.js)

A modern, responsive frontend for the GymRank powerlifting platform built with Next.js, React, and shadcn/ui components.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Backend API running on port 3001

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   The frontend is configured to connect to the backend API. Update `.env.local` if needed:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## 🏗️ Architecture

### Frontend-Backend Integration
The frontend acts as a proxy to the backend API:
- All API routes in `/src/app/api/` forward requests to the backend
- No database logic in the frontend
- Clean separation of concerns

### Key Features
- **shadcn/ui Components**: Modern, accessible UI components
- **Responsive Design**: Works on all device sizes
- **TypeScript**: Full type safety
- **API Proxy**: Seamless backend integration
- **Authentication**: JWT-based auth with context
- **Form Handling**: Robust form validation and submission

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                 # API proxy routes
│   ├── auth/               # Authentication pages
│   ├── leaderboard/        # Leaderboard page
│   ├── profile/            # User profile page
│   ├── teams/              # Teams page
│   ├── videos/             # Videos page
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── Navigation.tsx      # Navigation component
├── contexts/
│   └── AuthContext.tsx     # Authentication context
└── lib/
    ├── api.ts              # API utilities
    ├── auth.ts             # Auth utilities
    ├── types.ts            # TypeScript types
    └── utils.ts            # Utility functions
```

## 🔧 Development

### Running with Backend
1. Start the backend server on port 3001
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
3. Access the app at `http://localhost:3000`

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components
- **CSS Variables**: Theme customization support
- **Dark Mode**: Automatic dark mode detection

## 🔐 Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001)

## 📝 Notes

- The frontend requires the backend API to be running
- All API routes are proxied to the backend
- shadcn/ui components provide a consistent design system
- Built with Next.js 15 and React 19