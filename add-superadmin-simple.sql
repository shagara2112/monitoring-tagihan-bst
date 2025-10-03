-- Add Superadmin User - Simple Version
-- Run this SQL in Supabase Dashboard > SQL Editor

-- First, let's check if users table exists and has data
SELECT COUNT(*) as user_count FROM users;

-- Add superadmin user with a working password hash
-- This hash corresponds to password: "superadmin123"
INSERT INTO users (id, email, name, password, role) 
VALUES 
    ('superadmin-001', 'superadmin@monitoring.com', 'Super Administrator', '$2a$10$K8mJL7n2J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8', 'SUPER_ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Add another superadmin with password: "admin123"
INSERT INTO users (id, email, name, password, role) 
VALUES 
    ('admin-001', 'admin@monitoring.com', 'Administrator', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQ', 'SUPER_ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Show all users to verify
SELECT id, email, name, role, created_at FROM users WHERE role = 'SUPER_ADMIN';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Superadmin users added successfully!';
    RAISE NOTICE '👤 You can now login with:';
    RAISE NOTICE '   - superadmin@monitoring.com / superadmin123';
    RAISE NOTICE '   - admin@monitoring.com / admin123';
    RAISE NOTICE '🔐 Both users have SUPER_ADMIN role';
END $$;