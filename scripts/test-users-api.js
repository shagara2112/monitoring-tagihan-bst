#!/usr/bin/env node

require('dotenv').config();

async function testUsersAPI() {
  try {
    console.log('🔍 Testing users API with authentication...\n');

    // First, login to get auth token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'superadmin@monitoring.com',
        password: 'superadmin123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log(`   User: ${loginData.user.name} (${loginData.user.role})`);

    // Get cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Test users API
    console.log('\n🔍 Testing users API...');
    const usersResponse = await fetch('http://localhost:3000/api/users', {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (!usersResponse.ok) {
      console.error('❌ Users API failed:', usersResponse.status);
      const errorData = await usersResponse.json();
      console.error('   Error:', errorData.error);
      return;
    }

    const usersData = await usersResponse.json();
    console.log('✅ Users API successful!');
    console.log(`   Total users: ${usersData.users.length}`);

    // Show sample users
    console.log('\n👥 Sample Users:');
    usersData.users.slice(0, 5).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name || user.email} (${user.role})`);
      console.log(`      Invoices: ${user._count?.invoices || 0}`);
      console.log(`      Created: ${new Date(user.createdAt).toLocaleDateString()}`);
      console.log('');
    });

    // Test staff user access (should fail)
    console.log('🔍 Testing staff user access (should fail)...');
    const staffLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'staff@monitoring.com',
        password: 'staff123'
      })
    });

    if (staffLoginResponse.ok) {
      const staffCookies = staffLoginResponse.headers.get('set-cookie');
      const staffUsersResponse = await fetch('http://localhost:3000/api/users', {
        headers: {
          'Cookie': staffCookies || ''
        }
      });

      if (staffUsersResponse.status === 403) {
        console.log('✅ Staff user correctly denied access to users API');
      } else {
        console.log('❌ Staff user should not have access to users API');
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testUsersAPI();