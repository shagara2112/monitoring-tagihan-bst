# 📊 Invoice Management System

Aplikasi manajemen tagihan modern yang dibangun dengan Next.js 15, TypeScript, dan Supabase.

## ✨ Features

### 🎯 Core Features
- **Invoice Management**: CRUD operations lengkap untuk tagihan
- **User Authentication**: Login/logout dengan role-based access control
- **Analytics Dashboard**: Analisis data tagihan per wilayah
- **Pagination**: 25 items per halaman dengan navigasi yang smooth
- **Advanced Filtering**: Filter berdasarkan status, klien, posisi, wilayah, tanggal, dan jumlah
- **Bulk Actions**: Select multiple invoices untuk batch operations
- **Real-time Updates**: Socket.IO untuk real-time notifications

### 🎨 UI/UX Features
- **Toast Notifications**: Sistem notifikasi yang user-friendly
- **Debounced Search**: Pencarian yang optimal dengan 300ms delay
- **Responsive Design**: Mobile-first approach dengan Tailwind CSS
- **Loading States**: Skeleton loaders dan loading indicators
- **Dark Mode Support**: Tema gelap/terang (dapat ditambahkan)
- **Keyboard Shortcuts**: Navigasi dengan keyboard (dapat ditambahkan)

### 🔧 Technical Features
- **TypeScript**: Type safety penuh
- **Supabase Integration**: Database dan authentication
- **API Routes**: RESTful API yang well-structured
- **Error Boundaries**: Error handling yang robust
- **Performance Optimization**: Lazy loading dan code splitting
- **SEO Friendly**: Meta tags dan structured data

## 🛠 Tech Stack

- **Framework**: Next.js 15 dengan App Router
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4 dengan shadcn/ui
- **Authentication**: NextAuth.js v4
- **State Management**: Zustand + React Query
- **Real-time**: Socket.IO
- **Deployment**: Vercel (recommended)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Akun Supabase

### Setup Instructions

1. **Clone Repository**
```bash
git clone https://github.com/USERNAME/invoice-management-system.git
cd invoice-management-system
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Variables**
Buat file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
```

4. **Database Setup**
```bash
# Push schema ke database
npm run db:push

# Seed data (opsional)
npm run db:seed
```

5. **Run Development Server**
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── page.tsx           # Dashboard utama
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── admin/            # Admin components
│   └── invoice-*.tsx     # Invoice components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utility libraries
└── types/                # TypeScript types
```

## 👥 User Roles

### SUPER_ADMIN
- Akses penuh ke semua fitur
- Manajemen user
- Backup database
- Analytics lengkap

### ADMIN
- Manajemen invoice
- Analytics
- Export data

### MANAGER
- View dan edit invoice
- Analytics dasar
- Export terbatas

### STAFF
- Create invoice
- View invoice sendiri
- Edit terbatas

## 📊 Analytics Features

### Dashboard Metrics
- Total tagihan dan jumlah
- Tagihan lunas vs pending
- Overdue invoices tracking
- Regional breakdown

### Visualizations
- Progress bars untuk completion rate
- Bar charts untuk regional comparison
- Color-coded status indicators
- Responsive grid layouts

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation dan sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

## 🚀 Performance Optimizations

- Code splitting dengan Next.js
- Image optimization
- Debounced search (300ms)
- Pagination untuk large datasets
- Lazy loading components
- Database query optimization
- Caching strategies

## 📱 Responsive Design

- Mobile-first approach
- Touch-friendly interfaces
- Adaptive layouts
- Optimized for all screen sizes
- Progressive enhancement

## 🔄 Real-time Features

- Socket.IO integration
- Live updates untuk invoice status
- Real-time notifications
- Collaborative editing (future)

## 📤 Export Features

- CSV export untuk invoices
- Filtered data export
- Backup database functionality
- Custom date range exports

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)
1. Hubungkan repository GitHub ke Vercel
2. Setup environment variables
3. Deploy otomatis pada setiap push ke main

### Manual Deployment
```bash
# Build untuk production
npm run build

# Start production server
npm start
```

## 📝 API Documentation

### Endpoints
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `GET /api/invoices/analytics` - Analytics data
- `GET /api/users` - User management
- `POST /api/auth/login` - Authentication

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 🆘 Support

Jika ada pertanyaan atau issues:
- Create GitHub Issue
- Email: support@example.com
- Documentation: [Link ke docs]

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic CRUD operations
- ✅ User authentication
- ✅ Analytics dashboard
- ✅ Pagination dan filtering

### Phase 2 (Next)
- 🔄 Advanced analytics dengan charts
- 🔄 Email notifications
- 🔄 Invoice templates
- 🔄 Multi-currency support

### Phase 3 (Future)
- 📋 Mobile app (React Native)
- 📋 Payment gateway integration
- 📋 Advanced reporting
- 📋 API untuk third-party integrations

---

🤖 **Generated with [Claude Code](https://claude.ai/code)**