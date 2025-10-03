#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration. Please check your .env file.');
    process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

async function addSuperadmin() {
    try {
        console.log('🔧 Adding superadmin user to database...');

        // Hash passwords
        const password1 = await hashPassword('superadmin123');
        const password2 = await hashPassword('admin123');
        const password3 = await hashPassword('password123');

        // Superadmin users to add
        const superadminUsers = [
            {
                id: 'superadmin-001',
                email: 'superadmin@monitoring.com',
                name: 'Super Administrator',
                password: password1,
                role: 'SUPER_ADMIN'
            },
            {
                id: 'superadmin-002',
                email: 'admin@monitoring.com',
                name: 'Administrator',
                password: password2,
                role: 'SUPER_ADMIN'
            },
            {
                id: 'superadmin-003',
                email: 'sa@monitoring.com',
                name: 'Super Admin',
                password: password3,
                role: 'SUPER_ADMIN'
            }
        ];

        // Add each superadmin user
        for (const user of superadminUsers) {
            const { data, error } = await supabase
                .from('users')
                .upsert(user, { onConflict: 'email' })
                .select();

            if (error) {
                console.error(`❌ Error adding user ${user.email}:`, error.message);
            } else {
                console.log(`✅ Successfully added/updated user: ${user.email}`);
            }
        }

        console.log('\n🎉 Superadmin users added successfully!');
        console.log('\n📋 Available superadmin accounts:');
        console.log('   📧 superadmin@monitoring.com / 🔑 superadmin123');
        console.log('   📧 admin@monitoring.com / 🔑 admin123');
        console.log('   📧 sa@monitoring.com / 🔑 password123');
        console.log('\n🔐 All users have SUPER_ADMIN role with full system access.');

    } catch (error) {
        console.error('❌ Error adding superadmin users:', error.message);
        process.exit(1);
    }
}

// Run the script
addSuperadmin();