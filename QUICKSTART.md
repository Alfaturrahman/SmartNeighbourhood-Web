# 🚀 Quick Start Guide

Panduan cepat untuk memulai development Smart Neighborhood.

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment (Optional untuk testing)
```bash
# Buat file .env.local (opsional, app bisa jalan tanpa ini)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open Browser
```
http://localhost:3000
```

**That's it! 🎉** Aplikasi sudah running dengan dummy data.

---

## 🎯 First Steps

### Login ke Aplikasi

1. Klik menu **"🔐 Masuk"** atau buka `http://localhost:3000/login`
2. Isi form login (gunakan email apapun untuk testing):
   - Email: `admin@test.com`
   - Password: `password`
   - Role: Pilih salah satu (Admin, Keamanan, atau Warga)
3. Click **"Masuk"**

### Navigasi Aplikasi

Setelah login, Anda bisa akses:

- **📊 Dashboard** - Overview data dan statistik
- **👥 Manajemen Warga** - CRUD data warga (Admin only)
- **🔒 Jadwal Keamanan** - Kelola jadwal shift (Admin & Keamanan)
- **💬 Feedback** - Lihat dan kelola feedback (Admin & Warga)
- **📢 Pengumuman** - Buat dan lihat pengumuman (Semua role)

---

## 🧪 Testing Different Roles

Aplikasi memiliki 3 role dengan akses berbeda:

### Role: Admin (RT/RW) ✨ Full Access
```
Email: admin@test.com
Role: 👨‍💼 RT/RW
```

**Akses:**
- ✅ Semua fitur
- ✅ Kelola warga
- ✅ Kelola jadwal keamanan
- ✅ Kelola pengumuman
- ✅ Lihat dan balas feedback

### Role: Keamanan (Security) 🔐 Limited Access
```
Email: security@test.com
Role: 🔐 Keamanan
```

**Akses:**
- ✅ Lihat jadwal keamanan
- ✅ Lihat pengumuman
- ❌ Tidak bisa kelola warga
- ❌ Tidak bisa kelola feedback

### Role: Warga (Resident) 👤 Basic Access
```
Email: resident@test.com
Role: 👤 Warga
```

**Akses:**
- ✅ Lihat dashboard
- ✅ Lihat pengumuman
- ✅ Submit feedback
- ❌ Tidak bisa kelola warga
- ❌ Tidak bisa kelola jadwal

---

## 📦 Try Key Features

### Add New Resident (Admin Only)
1. Login sebagai Admin
2. Go to **👥 Manajemen Warga**
3. Click **"+ Tambah Warga"**
4. Fill form dan submit
5. Lihat data baru di tabel

### Submit Feedback (Resident)
1. Login sebagai Warga
2. Go to **💬 Feedback**
3. Click **"+ Berikan Feedback"**
4. Isi title, content, dan rating
5. Submit dan lihat di list

### Create Announcement (Admin)
1. Login sebagai Admin
2. Go to **📢 Pengumuman**
3. Click **"+ Buat Pengumuman"**
4. Pilih priority (High/Medium/Low)
5. Submit dan lihat hasil

---

## 🛠️ Development Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Clean install
npm run clean
npm run reinstall
```

---

## 📱 Test PWA Features

### Install as App

**Desktop (Chrome/Edge):**
1. Click install icon di address bar
2. Or: Menu (⋮) → "Install Smart Neighborhood"

**Mobile:**
1. Open di browser (Chrome/Safari)
2. Menu → "Add to Home Screen"
3. Icon akan muncul di home screen

### Offline Mode
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Refresh page
5. App masih bisa diakses (cached)

---

## 🎨 Customize Theme

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    DEFAULT: "#YOUR_COLOR",
  },
  secondary: {
    DEFAULT: "#YOUR_COLOR",
  },
}
```

Or use constants:

Edit `lib/constants.ts`:
```typescript
export const COLORS = {
  PRIMARY: '#YOUR_COLOR',
  SECONDARY: '#YOUR_COLOR',
}
```

---

## 📚 Learn More

### File Structure
```
app/          - Pages & routes
components/   - Reusable UI components
hooks/        - Custom React hooks
lib/          - Utilities & helpers
services/     - API services
types/        - TypeScript types
```

### Key Files
- `app/layout.tsx` - Root layout
- `components/Sidebar.tsx` - Navigation
- `services/api.ts` - API client
- `lib/rolePermissions.ts` - Access control
- `types/index.ts` - Type definitions

### Documentation
- [README.md](README.md) - Full documentation
- [API.md](API.md) - API reference
- [SETUP.md](SETUP.md) - Detailed setup
- [ENHANCEMENTS.md](ENHANCEMENTS.md) - What's new

---

## 🔧 Common Tasks

### Add New Page
1. Create folder in `app/` (e.g., `app/reports/`)
2. Add `page.tsx` file
3. Use template:
```typescript
"use client";
export default function ReportsPage() {
  return <div>Reports Page</div>;
}
```

### Add New Component
1. Create in `components/` (e.g., `Card.tsx`)
2. Export component
3. Import where needed:
```typescript
import Card from '@/components/Card';
```

### Add New API Service
1. Create in `services/modules/`
2. Define service functions
3. Export from `services/modules/index.ts`
4. Use in components:
```typescript
import { yourService } from '@/services/modules';
```

---

## 🐛 Troubleshooting

### App not starting?
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Styles not working?
- Check if Tailwind CSS is loaded
- Clear browser cache
- Restart dev server

### TypeScript errors?
```bash
npm run type-check
```

---

## 🎯 Next Steps

1. **Explore the codebase** - Familiarize yourself
2. **Try different roles** - Understand permissions
3. **Read documentation** - Check README.md
4. **Connect to backend** - Replace dummy data
5. **Customize design** - Make it yours!

---

## 💡 Pro Tips

- Use **React DevTools** untuk debugging
- Check **Network tab** untuk API calls
- Use **Components tab** untuk inspect state
- Enable **Source Maps** untuk debugging
- Use **TypeScript** untuk type safety

---

## 🆘 Need Help?

- 📖 Read [README.md](README.md)
- 🔧 Check [SETUP.md](SETUP.md)
- 💻 Review [CONTRIBUTING.md](CONTRIBUTING.md)
- 🌐 Open an issue on GitHub

---

**Happy Coding! 🚀**

Start building amazing features for your neighborhood community!
