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

async function addStaffUsers() {
  try {
    console.log('🔧 Adding staff users to database...\n');

    // Hash passwords for staff users
    const password1 = await hashPassword('staff123');
    const password2 = await hashPassword('manager123');
    const password3 = await hashPassword('user123');
    const password4 = await hashPassword('mitra123');

    // Staff users to add
    const staffUsers = [
      {
        id: 'staff-001',
        email: 'staff@monitoring.com',
        name: 'Staff User',
        password: password1,
        role: 'STAFF'
      },
      {
        id: 'manager-001',
        email: 'manager@monitoring.com',
        name: 'Manager User',
        password: password2,
        role: 'MANAGER'
      },
      {
        id: 'user-001',
        email: 'user@monitoring.com',
        name: 'Regular User',
        password: password3,
        role: 'STAFF'
      },
      {
        id: 'mitra-001',
        email: 'mitra@monitoring.com',
        name: 'Mitra Partner',
        password: password4,
        role: 'STAFF'
      },
      {
        id: 'staff-002',
        email: 'finance@monitoring.com',
        name: 'Finance Staff',
        password: password1,
        role: 'STAFF'
      },
      {
        id: 'staff-003',
        email: 'admin@finance.com',
        name: 'Finance Admin',
        password: password2,
        role: 'ADMIN'
      }
    ];

    // Add each staff user
    for (const user of staffUsers) {
      const { data, error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'email' })
        .select();

      if (error) {
        console.error(`❌ Error adding user ${user.email}:`, error.message);
      } else {
        console.log(`✅ Successfully added/updated user: ${user.email} (${user.role})`);
      }
    }

    console.log('\n🎉 Staff users added successfully!');
    console.log('\n📋 Available staff accounts:');
    console.log('   👤 staff@monitoring.com / staff123 (STAFF)');
    console.log('   👔 manager@monitoring.com / manager123 (MANAGER)');
    console.log('   👤 user@monitoring.com / user123 (STAFF)');
    console.log('   🤝 mitra@monitoring.com / mitra123 (STAFF)');
    console.log('   💰 finance@monitoring.com / staff123 (STAFF)');
    console.log('   🔷 admin@finance.com / manager123 (ADMIN)');
    console.log('\n🔐 Role permissions:');
    console.log('   👑 SUPER_ADMIN: Full system access');
    console.log('   🔷 ADMIN: Admin access to most features');
    console.log('   👔 MANAGER: Management access to reports and analytics');
    console.log('   👤 STAFF: Basic access to invoice management');

  } catch (error) {
    console.error('❌ Error adding staff users:', error.message);
    process.exit(1);
  }
}

// Run the script
addStaffUsers();