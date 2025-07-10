-- Fresh Database Setup for GymRank
-- Copy and paste this into your NeonDB SQL console

-- Create users table
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

-- Insert your user (recreating danialbka2)
-- Note: Password hash is for "password123" - change this after login!
INSERT INTO users (username, password_hash, email, display_name, flag, team, weight, gender, elo, is_active) 
VALUES (
    'danialbka2',
    '$2b$12$TPd5waE40C161VaCG4jRwecsjuV8KO5NXuNTpb40ENWg4HhMW0bzq',
    'danial@example.com',
    'Danial',
    '🇸🇬',
    'HomeTeamNS Khatib',
    90,
    'male',
    1240,
    true
);

-- Insert some sample PR data
INSERT INTO prs (username, lift_type, weight, video_url) 
VALUES 
    ('danialbka2', 'bench', 80, 'https://www.instagram.com/p/sample1'),
    ('danialbka2', 'squat', 120, 'https://www.instagram.com/p/sample2'),
    ('danialbka2', 'deadlift', 140, 'https://www.instagram.com/p/sample3');

-- Create a few more sample users for testing
INSERT INTO users (username, password_hash, display_name, flag, team, weight, gender, elo) 
VALUES 
    ('testuser1', '$2b$12$TPd5waE40C161VaCG4jRwecsjuV8KO5NXuNTpb40ENWg4HhMW0bzq', 'Test User 1', '🇺🇸', 'Team Alpha', 75, 'male', 1100),
    ('testuser2', '$2b$12$TPd5waE40C161VaCG4jRwecsjuV8KO5NXuNTpb40ENWg4HhMW0bzq', 'Test User 2', '🇬🇧', 'Team Beta', 65, 'female', 950);

-- Add some PRs for the test users
INSERT INTO prs (username, lift_type, weight, video_url) 
VALUES 
    ('testuser1', 'bench', 70, 'https://www.youtube.com/watch?v=sample1'),
    ('testuser1', 'squat', 100, 'https://www.youtube.com/watch?v=sample2'),
    ('testuser2', 'bench', 50, 'https://www.tiktok.com/@user/video/sample1'),
    ('testuser2', 'deadlift', 90, 'https://www.tiktok.com/@user/video/sample2');

-- Verify everything was created
SELECT 'Users created:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'PRs created:' as info, COUNT(*) as count FROM prs;

-- Show all users
SELECT id, username, display_name, flag, team, weight, gender, elo FROM users ORDER BY elo DESC;

-- Show all PRs
SELECT id, username, lift_type, weight, video_url, created_at FROM prs ORDER BY created_at DESC;