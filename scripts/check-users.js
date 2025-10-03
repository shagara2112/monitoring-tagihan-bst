#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
    try {
        console.log('🔍 Checking users in database...\n');
        
        // Get all users
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, name, role, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching users:', error.message);
            return;
        }

        if (users.length === 0) {
            console.log('📭 No users found in database.');
            return;
        }

        console.log(`📊 Found ${users.length} user(s):\n`);
        
        users.forEach((user, index) => {
            const roleIcon = user.role === 'SUPER_ADMIN' ? '👑' : 
                           user.role === 'ADMIN' ? '🔷' : 
                           user.role === 'MANAGER' ? '📋' : '👤';
            
            console.log(`${index + 1}. ${roleIcon} ${user.name}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🔐 Role: ${user.role}`);
            console.log(`   📅 Created: ${new Date(user.created_at).toLocaleString()}`);
            console.log('');
        });

        // Show superadmin users specifically
        const superadmins = users.filter(user => user.role === 'SUPER_ADMIN');
        if (superadmins.length > 0) {
            console.log('👑 Superadmin users can login with:');
            superadmins.forEach(user => {
                let password = '';
                if (user.email === 'superadmin@monitoring.com') password = 'superadmin123';
                else if (user.email === 'admin@monitoring.com') password = 'admin123';
                else if (user.email === 'sa@monitoring.com') password = 'password123';
                
                console.log(`   📧 ${user.email} / 🔑 ${password}`);
            });
        }

    } catch (error) {
        console.error('❌ Error checking users:', error.message);
    }
}

checkUsers();