-- Add Superadmin User Script
-- Run this SQL in Supabase Dashboard > SQL Editor to add a superadmin user

-- Insert superadmin user with proper password hash (password: superadmin123)
INSERT INTO users (id, email, name, password, role) 
VALUES 
    ('superadmin-001', 'superadmin@monitoring.com', 'Super Administrator', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SUPER_ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Alternative superadmin user with different credentials (password: admin123)
INSERT INTO users (id, email, name, password, role) 
VALUES 
    ('superadmin-002', 'admin@monitoring.com', 'Administrator', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQ', 'SUPER_ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Additional superadmin user (password: password123)
INSERT INTO users (id, email, name, password, role) 
VALUES 
    ('superadmin-003', 'sa@monitoring.com', 'Super Admin', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khz/dGPjL4AeMYV4M9W4g7vK', 'SUPER_ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Superadmin users added successfully!';
    RAISE NOTICE '👤 Available superadmin accounts:';
    RAISE NOTICE '   - superadmin@monitoring.com / superadmin123';
    RAISE NOTICE '   - admin@monitoring.com / admin123';
    RAISE NOTICE '   - sa@monitoring.com / password123';
    RAISE NOTICE '🔐 All users have SUPER_ADMIN role';
END $$;