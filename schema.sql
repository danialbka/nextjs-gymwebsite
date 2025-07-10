-- GymRank Database Schema
-- Complete schema for the gym ranking application

-- Create users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS prs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    lift_type VARCHAR(20) NOT NULL CHECK (lift_type IN ('bench', 'squat', 'deadlift')),
    weight FLOAT NOT NULL,
    video_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_elo ON users(elo DESC);
CREATE INDEX IF NOT EXISTS idx_users_team ON users(team);
CREATE INDEX IF NOT EXISTS idx_prs_username ON prs(username);
CREATE INDEX IF NOT EXISTS idx_prs_lift_type ON prs(lift_type);
CREATE INDEX IF NOT EXISTS idx_prs_created_at ON prs(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts and profile information';
COMMENT ON TABLE prs IS 'Personal records for lifts with optional video proof';
COMMENT ON COLUMN users.weight IS 'User body weight in kilograms';
COMMENT ON COLUMN users.gender IS 'User gender (male/female) for DOTS score calculation';
COMMENT ON COLUMN users.elo IS 'ELO rating based on total lifted weight';
COMMENT ON COLUMN prs.video_url IS 'URL to video proof (Instagram, YouTube, etc.)';