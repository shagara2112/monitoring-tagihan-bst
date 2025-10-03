#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Test the authentication flow
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAuth() {
  try {
    console.log('🔍 Testing authentication flow...\n');
    
    // Test 1: Check if superadmin users exist
    console.log('1. Checking superadmin users...');
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'SUPER_ADMIN');
    
    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }
    
    console.log(`✅ Found ${users.length} superadmin users:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name})`);
    });
    
    // Test 2: Test login API endpoint
    console.log('\n2. Testing login API...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'superadmin@monitoring.com',
        password: 'superadmin123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log(`   User: ${data.user.name} (${data.user.email})`);
      console.log(`   Role: ${data.user.role}`);
    } else {
      console.error('❌ Login failed:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAuth();