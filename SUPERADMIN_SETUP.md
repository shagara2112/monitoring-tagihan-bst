# Add Superadmin User Guide

## ✅ Superadmin Users Successfully Added!

The following superadmin users have been successfully added to your database:

### 👑 Available Superadmin Accounts:

1. **superadmin@monitoring.com** / **superadmin123**
2. **admin@monitoring.com** / **admin123** 
3. **sa@monitoring.com** / **password123**

All users have **SUPER_ADMIN** role with full system access.

## 🔧 How to Add More Superadmin Users

### Option 1: Use the Automated Script
```bash
node scripts/add-superadmin.js
```

### Option 2: Add Manually via Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL query:

```sql
-- Add a new superadmin user
INSERT INTO users (id, email, name, password, role) 
VALUES 
    ('your-unique-id', 'email@example.com', 'User Name', '$2a$10$K8mJL7n2J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8', 'SUPER_ADMIN')
ON CONFLICT (email) DO NOTHING;
```

### Option 3: Use the Simple SQL Script
Run the `add-superadmin-simple.sql` file in your Supabase SQL Editor.

## 🔐 Password Hashing

The passwords are hashed using bcrypt. To generate new password hashes:

1. Use an online bcrypt generator
2. Or use the Node.js script with bcrypt
3. Salt rounds: 10

## 🚀 Next Steps

1. **Test Login**: Try logging in with any of the superadmin accounts
2. **Verify Access**: Ensure you can access all admin features
3. **Create Additional Users**: Add more staff users as needed

## 📞 Support

If you encounter any issues:
- Check the database connection in your `.env` file
- Ensure the users table exists (run `supabase-schema.sql` if needed)
- Verify the Supabase service role key has proper permissions

---

**✨ Your monitoring system is now ready with superadmin access!**