-- Manual Database Setup for GymRank
-- Copy and paste this into your NeonDB SQL console

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS prs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with all required columns
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(100),
    flag VARCHAR(10) NOT NULL,
    team VARCHAR(100) DEFAULT 'Independent',
    weight FLOAT,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    elo INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create PRs (Personal Records) table
CREATE TABLE prs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    lift_type VARCHAR(20) NOT NULL CHECK (lift_type IN ('bench', 'squat', 'deadlift')),
    weight FLOAT NOT NULL,
    video_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_elo ON users(elo DESC);
CREATE INDEX idx_users_team ON users(team);
CREATE INDEX idx_prs_username ON prs(username);
CREATE INDEX idx_prs_lift_type ON prs(lift_type);
CREATE INDEX idx_prs_created_at ON prs(created_at DESC);

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Show the structure of users table
\d users;

-- Show the structure of prs table  
\d prs;