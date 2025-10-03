#!/usr/bin/env node

require('dotenv').config();

async function testInvoiceAPI() {
  try {
    console.log('🔍 Testing invoice API with authentication...\n');

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
    
    // Test invoices API
    console.log('\n🔍 Testing invoices API...');
    const invoicesResponse = await fetch('http://localhost:3000/api/invoices', {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (!invoicesResponse.ok) {
      console.error('❌ Invoices API failed:', invoicesResponse.status);
      const errorData = await invoicesResponse.json();
      console.error('   Error:', errorData.error);
      return;
    }

    const invoicesData = await invoicesResponse.json();
    console.log('✅ Invoices API successful!');
    console.log(`   Total invoices: ${invoicesData.invoices.length}`);
    console.log(`   Stats:`, invoicesData.stats);

    // Show sample invoices
    console.log('\n📋 Sample Invoices:');
    invoicesData.invoices.slice(0, 3).forEach((inv, index) => {
      console.log(`   ${index + 1}. ${inv.invoiceNumber} - ${inv.clientName}`);
      console.log(`      Amount: Rp ${inv.totalAmount.toLocaleString('id-ID')}`);
      console.log(`      Status: ${inv.status} | Position: ${inv.position}`);
      console.log(`      Region: ${inv.workRegion}`);
      console.log(`      Created by: ${inv.createdBy?.name || 'Unknown'}`);
      console.log('');
    });

    // Test stats calculation
    const stats = invoicesData.stats;
    console.log('📊 Dashboard Stats:');
    console.log(`   Total Invoices: ${stats.totalInvoices}`);
    console.log(`   Total Amount: Rp ${stats.totalAmount.toLocaleString('id-ID')}`);
    console.log(`   Settled: ${stats.settledInvoices} (Rp ${stats.settledAmount.toLocaleString('id-ID')})`);
    console.log(`   Pending: ${stats.pendingInvoices} (Rp ${stats.pendingAmount.toLocaleString('id-ID')})`);
    console.log(`   Overdue: ${stats.overdueInvoices}`);

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testInvoiceAPI();