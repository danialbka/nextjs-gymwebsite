-- Migration script to move data from JSON files to NeonDB
-- Run this in your NeonDB console after creating the tables

-- First, create the tables (from manual-db-setup.sql)
-- Then insert your existing data:

-- Insert user data (adding missing id column)
INSERT INTO users (username, flag, elo, created_at, password_hash, email, display_name, is_active, last_login, team, weight, gender) 
VALUES (
    'danialbka2',
    '🇸🇬',
    1240,
    '2025-07-07 11:57:39.02327',
    '$2b$12$TPd5waE40C161VaCG4jRwecsjuV8KO5NXuNTpb40ENWg4HhMW0bzq',
    NULL,
    'Danial',
    true,
    '2025-07-08 19:10:44.1333',
    'HomeTeamNS Khatib',
    90,
    'male'
);

-- Insert PR data
INSERT INTO prs (id, username, lift_type, weight, video_url, created_at) 
VALUES 
    (9, 'danialbka2', 'bench', 80, '/uploads/6b711be3-52d3-4244-a6fa-82521c3ed50d.mp4', '2025-07-08 11:28:20.164562'),
    (10, 'danialbka2', 'bench', 80, '/uploads/a0eae99e-c2d2-4820-b38c-bf89b0981f60.mp4', '2025-07-08 11:28:56.315206');

-- Update the sequence for prs table to avoid conflicts
SELECT setval('prs_id_seq', (SELECT MAX(id) FROM prs));

-- Verify the data was inserted
SELECT 'Users count:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'PRs count:' as info, COUNT(*) as count FROM prs;

-- Show the user data
SELECT id, username, email, display_name, elo, team, weight, gender FROM users;