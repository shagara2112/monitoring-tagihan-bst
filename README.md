# Invoice Management System

A comprehensive invoice management system built with Next.js, TypeScript, Prisma, and Supabase for tracking and managing invoices with role-based access control.

## 🚀 Features

- **User Authentication & Authorization**: Role-based access control (SUPER_ADMIN, ADMIN, MANAGER, STAFF)
- **Invoice Management**: Create, read, update, and delete invoices
- **Invoice Workflow Tracking**: Track invoice status through approval workflow
- **Invoice History**: Audit trail for all invoice changes
- **Regional Support**: Support for different work regions (TARAKAN, BALIKPAPAN, SAMARINDA)
- **Invoice Categories**: Categorize invoices by work type
- **Analytics Dashboard**: Comprehensive invoice analytics and reporting
- **Real-time Updates**: Socket.IO for real-time data updates
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with custom middleware
- **Real-time**: Socket.IO
- **Styling**: Tailwind CSS, Lucide Icons

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/shagara2112/Monitoring-Tagihan.git
cd Monitoring-Tagihan
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

# JWT Secret
JWT_SECRET="YOUR_JWT_SECRET"
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"
NEXTAUTH_URL="http://localhost:3000"

# Application Configuration
NODE_ENV="development"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Create a super admin user

```bash
# Run the create user script
node create-user.js
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

The application uses the following main tables:

- **User**: Stores user information and roles
- **Invoice**: Stores invoice information and status
- **InvoiceHistory**: Tracks changes to invoices

### User Roles

- **SUPER_ADMIN**: Full access to all features
- **ADMIN**: Can manage users and invoices
- **MANAGER**: Can manage invoices and view analytics
- **STAFF**: Can create and manage own invoices

### Invoice Status Workflow

1. **DRAFT** → Initial state
2. **SUBMITTED** → Submitted for review
3. **INTERNAL_VALIDATION** → Under internal review
4. **AWAITING_PAYMENT** → Approved, awaiting payment
5. **SETTLED** → Payment completed
6. **DELAYED** → Payment overdue

### Invoice Positions

- **MITRA** → Partner level
- **USER** → User level
- **AREA** → Area level
- **REGIONAL** → Regional level
- **HEAD_OFFICE** → Head office level
- **APM** → APM level
- **TERBAYAR** → Paid

## 🔐 Authentication

The application uses JWT-based authentication with the following default credentials:

```
👑 Super Admin:
Email: superadmin@monitoring.com
Password: superadmin123
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create user (admin only)

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice by ID
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `GET /api/invoices/[id]/history` - Get invoice history
- `GET /api/invoices/analytics` - Get invoice analytics
- `GET /api/invoices/export` - Export invoices

## 🌐 Deployment

### Deploy to Vercel

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy the application

### Environment Variables for Production

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
JWT_SECRET="YOUR_JWT_SECRET"
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"
NEXTAUTH_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

## 🧪 Testing

The project includes several test scripts:

- `node check-connection.js` - Check database connection
- `node show-prisma-schema.js` - Display database schema
- `node test-supabase-input.js` - Test data input to Supabase

## 📈 Analytics

The system provides comprehensive analytics including:

- Invoice status distribution
- Invoice position breakdown
- Regional performance metrics
- Payment status tracking
- Monthly revenue analysis

## 🔧 Customization

### Adding New Invoice Categories

Edit `prisma/schema.prisma`:

```prisma
enum InvoiceCategory {
  PASANG_BARU
  ASSURANCE
  MAINTENANCE
  OSP
  SIPIL
  KONSTRUKSI
  LAINNYA
  NEW_CATEGORY
}
```

### Adding New Work Regions

Edit `prisma/schema.prisma`:

```prisma
enum WorkRegion {
  TARAKAN
  BALIKPAPAN
  SAMARINDA
  NEW_REGION
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the [Issues](https://github.com/shagara2112/Monitoring-Tagihan/issues) page
2. Create a new issue if needed
3. Include detailed information about the problem

## 🔄 Updates

- v1.0.0 - Initial release with basic invoice management
- v1.1.0 - Added analytics dashboard
- v1.2.0 - Added real-time updates with Socket.IO
- v1.3.0 - Added Supabase integration
- v1.4.0 - Enhanced invoice workflow and history tracking