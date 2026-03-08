# 🏘️ Smart Neighborhood - Manajemen Komunitas

Platform modern berbasis web untuk mengelola komunitas perumahan dengan fitur lengkap untuk pengelolaan warga, jadwal keamanan, feedback, dan pengumuman.

**🎉 Status: Fully Integrated with Backend API** ✅

## ✨ Fitur Utama

- 🔐 **Sistem Autentikasi** - Login dengan JWT token & role-based access (Admin/RT-RW, Keamanan, Warga)
- 👥 **Manajemen Warga** - CRUD data warga dengan pencarian dan filter
- 🔒 **Jadwal Keamanan** - Kelola jadwal shift keamanan (Pagi, Siang, Malam)
- 💬 **Feedback & Umpan Balik** - Sistem feedback dengan rating dan balasan
- 📢 **Pengumuman** - Buat dan kelola pengumuman dengan prioritas
- 📊 **Dashboard** - Overview data dan statistik komunitas
- 📱 **Progressive Web App (PWA)** - Dapat diinstal di mobile dan desktop
- 🎨 **Modern UI/UX** - Responsive design dengan Tailwind CSS
- 🔄 **Auto Token Refresh** - Seamless authentication dengan auto refresh token

## 🛠️ Teknologi

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Language:** TypeScript
- **API Client:** Axios
- **Alerts:** SweetAlert2
- **PWA:** next-pwa
- **Auth:** JWT with auto-refresh

### Backend
- **Framework:** Django + Django REST Framework
- **Database:** PostgreSQL
- **Authentication:** JWT (djangorestframework-simplejwt)
- **API:** RESTful API

## 📋 Prerequisites

- **Frontend:**
  - Node.js 20.x atau lebih baru
  - npm, yarn, pnpm, atau bun

- **Backend:**
  - Python 3.8+
  - PostgreSQL
  - Django backend (included in project)

## 🚀 Quick Start

### 1️⃣ Start Backend

```powershell
cd c:\Users\Rahman\Desktop\smartneighbour_backend

# Create test users (first time only)
python create_test_user.py

# Run server
python manage.py runserver
```

Backend: http://localhost:8000

### 2️⃣ Start Frontend

```powershell
cd C:\Users\Rahman\Downloads\Frontend\Frontend\smartneighbour

# Install dependencies (first time only)
npm install

# Run development server
npm run dev
```

Frontend: http://localhost:3000

### 3️⃣ Test Integration

```powershell
# Run automated test
.\test_integration.ps1
```

### 4️⃣ Login

Open http://localhost:3000/login

**Test Credentials:**
- **Admin:** admin@test.com / admin123
- **Security:** security@test.com / security123
- **Resident:** resident@test.com / resident123

## 📚 Documentation

- **[START.md](START.md)** - Quick start guide & troubleshooting
- **[INTEGRATION.md](INTEGRATION.md)** - Integration details & technical docs
- **[INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md)** - Complete integration summary
- **[API.md](API.md)** - Backend API documentation

## 🔧 Setup Environment
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_APP_NAME="Smart Neighborhood"
   NEXT_PUBLIC_APP_VERSION=1.0.0
   NODE_ENV=development
   ```

4. **Jalankan development server**
   ```bash
   npm run dev
   # atau
   yarn dev
   # atau
   pnpm dev
   ```

5. **Buka browser**
   
   Akses [http://localhost:3000](http://localhost:3000)

## 👤 Role & Permission

### Admin (RT/RW)
- ✅ Full access ke semua fitur
- ✅ Kelola data warga
- ✅ Kelola jadwal keamanan
- ✅ Kelola pengumuman
- ✅ Lihat dan balas feedback

### Keamanan
- ✅ Lihat jadwal keamanan
- ✅ Lihat pengumuman
- ✅ Submit laporan (future feature)

### Warga
- ✅ Lihat dashboard
- ✅ Lihat jadwal keamanan
- ✅ Lihat pengumuman
- ✅ Submit feedback

## 📁 Struktur Folder

```
smartneighbour/
├── app/                    # Next.js App Router
│   ├── announcements/      # Halaman pengumuman
│   ├── dashboard/          # Halaman dashboard
│   ├── feedback/           # Halaman feedback
│   ├── login/              # Halaman login
│   ├── residents/          # Halaman manajemen warga
│   │   └── add/           # Form tambah warga
│   ├── security-schedule/  # Halaman jadwal keamanan
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── ErrorBoundary.tsx  # Error handling component
│   ├── EmptyState.tsx     # Empty state component
│   ├── Header.tsx         # Header/navbar
│   ├── LayoutWrapper.tsx  # Layout wrapper dengan sidebar
│   ├── Loading.tsx        # Loading states
│   ├── Modal.tsx          # Modal component
│   └── Sidebar.tsx        # Sidebar navigation
├── lib/                   # Utilities & helpers
│   ├── rolePermissions.ts # Role-based access control
│   └── swalUtils.ts       # SweetAlert2 utilities
├── services/              # API services
│   └── api.ts            # Axios client & API calls
├── types/                 # TypeScript types
│   └── index.ts          # Type definitions
├── public/               # Static assets
│   ├── manifest.json     # PWA manifest
│   └── sw.js            # Service worker
├── middleware.ts         # Next.js middleware (auth)
├── tailwind.config.ts    # Tailwind configuration
├── next.config.ts        # Next.js configuration
└── package.json          # Dependencies

```

## 🎨 Customization

### Warna Tema

Edit file `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    DEFAULT: "#003366",  // Biru utama
    light: "#004d80",
    dark: "#002244",
  },
  secondary: {
    DEFAULT: "#FF9500",  // Orange
    light: "#FFB74D",
    dark: "#FF8C00",
  },
  // ... customize sesuai kebutuhan
}
```

### API Endpoint

Edit `NEXT_PUBLIC_API_URL` di file `.env.local`

## 📦 Build untuk Production

```bash
npm run build
npm start
```

## 🧪 Development Tips

- Gunakan React DevTools untuk debugging
- Check console untuk error messages
- Gunakan Network tab untuk monitor API calls
- Test di berbagai device untuk responsive

## 🔒 Security

- Simpan credentials di environment variables
- Jangan commit file `.env.local`
- Gunakan HTTPS di production
- Implement proper JWT token validation
- Sanitize user inputs

## 🐛 Troubleshooting

### Port sudah digunakan
```bash
# Gunakan port lain
PORT=3001 npm run dev
```

### Module not found
```bash
# Hapus node_modules dan reinstall
rm -rf node_modules
npm install
```

### Cache issues
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📝 TODO / Roadmap

- [ ] Integrasi dengan backend API real
- [ ] Unit & integration tests
- [ ] Email notifications
- [ ] Export data to Excel/PDF
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app (React Native)

## 👥 Kontribusi

Kontribusi selalu diterima! Silakan:
1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Project ini dibuat untuk keperluan edukasi dan development.

## 📞 Support

Jika ada pertanyaan atau issues, silakan buat issue di repository ini.

---

**Built with ❤️ using Next.js & React**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
