import { db } from '../lib/db';
import bcrypt from 'bcryptjs';

async function createUsers() {
  try {
    // Create super admin user
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = await db.user.upsert({
      where: { email: 'superadmin@example.com' },
      update: {},
      create: {
        email: 'superadmin@example.com',
        name: 'Super Administrator',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
      },
    });

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await db.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Administrator',
        password: adminPassword,
        role: 'ADMIN',
      },
    });

    // Create manager user
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await db.user.upsert({
      where: { email: 'manager@example.com' },
      update: {},
      create: {
        email: 'manager@example.com',
        name: 'Manager',
        password: managerPassword,
        role: 'MANAGER',
      },
    });

    // Create staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staff = await db.user.upsert({
      where: { email: 'staff@example.com' },
      update: {},
      create: {
        email: 'staff@example.com',
        name: 'Staff User',
        password: staffPassword,
        role: 'STAFF',
      },
    });

    console.log('Users created successfully:');
    console.log('Super Admin:', superAdmin.email, '- Password: superadmin123');
    console.log('Admin:', admin.email, '- Password: admin123');
    console.log('Manager:', manager.email, '- Password: manager123');
    console.log('Staff:', staff.email, '- Password: staff123');
    console.log('\n=== ROLE PERMISSIONS ===');
    console.log('SUPER ADMIN: Full system access including user management and database backup');
    console.log('ADMIN: Full invoice management access');
    console.log('MANAGER: Invoice management with limited permissions');
    console.log('STAFF: Basic invoice access');
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await db.$disconnect();
  }
}

createUsers();