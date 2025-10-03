#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Test staff login
async function testStaffLogin() {
  try {
    console.log('🔍 Testing staff user login...\n');
    
    // Test staff login
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'staff@monitoring.com',
        password: 'staff123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Staff login successful!');
      console.log(`   User: ${data.user.name} (${data.user.email})`);
      console.log(`   Role: ${data.user.role}`);
      console.log(`   Access Level: ${data.user.role === 'STAFF' ? 'Basic Invoice Management' : 'Unknown'}`);
    } else {
      console.error('❌ Staff login failed:', response.status);
      const errorData = await response.json();
      console.error('   Error:', errorData.error);
    }

    // Test manager login
    console.log('\n🔍 Testing manager user login...');
    const managerResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'manager@monitoring.com',
        password: 'manager123'
      })
    });
    
    if (managerResponse.ok) {
      const managerData = await managerResponse.json();
      console.log('✅ Manager login successful!');
      console.log(`   User: ${managerData.user.name} (${managerData.user.email})`);
      console.log(`   Role: ${managerData.user.role}`);
      console.log(`   Access Level: ${managerData.user.role === 'MANAGER' ? 'Reports & Analytics' : 'Unknown'}`);
    } else {
      console.error('❌ Manager login failed:', managerResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testStaffLogin();