# 🚀 Quick Start - Smart Neighborhood

## Langkah 1: Setup Backend

```powershell
# Navigate ke backend folder
cd c:\Users\Rahman\Desktop\smartneighbour_backend

# Activate virtual environment (jika ada)
# .\venv\Scripts\Activate.ps1

# Install dependencies (jika belum)
pip install -r requirements.txt

# Create test users
python create_test_user.py

# Run server
python manage.py runserver
```

Backend akan berjalan di: **http://localhost:8000**

---

## Langkah 2: Setup Frontend

```powershell
# Navigate ke frontend folder
cd C:\Users\Rahman\Downloads\Frontend\Frontend\smartneighbour

# Install dependencies (jika belum)
npm install

# Run development server
npm run dev
```

Frontend akan berjalan di: **http://localhost:3000**

---

## Langkah 3: Test Integration

```powershell
# Di folder frontend, jalankan test script
.\test_integration.ps1
```

Script ini akan mengecek:
- ✅ Backend API status
- ✅ Frontend app status
- ✅ CORS configuration
- ✅ Authentication flow
- ✅ Token refresh mechanism

---

## 🔐 Test Credentials

### Admin
- **Email:** admin@test.com
- **Password:** admin123
- **Role:** Admin (RT/RW)

### Security
- **Email:** security@test.com
- **Password:** security123
- **Role:** Security (Keamanan)

### Resident
- **Email:** resident@test.com
- **Password:** resident123
- **Role:** Resident (Warga)

---

## ✅ Verification Checklist

1. **Backend Running**
   - [ ] Server di http://localhost:8000
   - [ ] API endpoint accessible
   - [ ] Database connected

2. **Frontend Running**
   - [ ] App di http://localhost:3000
   - [ ] Login page tampil
   - [ ] No console errors

3. **Integration Working**
   - [ ] Login berhasil
   - [ ] Token tersimpan
   - [ ] Redirect ke dashboard
   - [ ] Protected routes berfungsi
   - [ ] Logout berfungsi

---

## 🎯 Features to Test

### 1. Authentication
- [x] Login dengan credentials valid
- [x] Login gagal dengan credentials invalid
- [x] Auto redirect ke /login jika tidak ada token
- [x] Logout dan clear token

### 2. Dashboard
- [ ] Tampil statistik
- [ ] Navigation berfungsi
- [ ] Sidebar toggle (mobile/desktop)

### 3. Residents Management
- [ ] List residents
- [ ] Add new resident
- [ ] Edit resident
- [ ] Delete resident
- [ ] Search & filter

### 4. Security Schedule
- [ ] View schedules
- [ ] Create schedule
- [ ] Update schedule
- [ ] Delete schedule

### 5. Feedback System
- [ ] View feedbacks
- [ ] Submit feedback (resident)
- [ ] Reply to feedback (admin)
- [ ] Rating system

### 6. Announcements
- [ ] View announcements
- [ ] Create announcement (admin)
- [ ] Edit announcement
- [ ] Delete announcement
- [ ] Priority levels

---

## 🐛 Troubleshooting

### Backend tidak bisa diakses
```powershell
# Check if server running
netstat -ano | findstr :8000

# Restart server
python manage.py runserver
```

### Frontend error: Cannot find module
```powershell
# Clear node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### CORS error di browser console
Check `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
]
```

### Login tidak redirect
1. Check console untuk error
2. Check Network tab - response dari /api/auth/login
3. Check localStorage - ada token?
4. Clear localStorage dan try again

### 401 Unauthorized pada API calls
1. Check Authorization header format: `Bearer <token>`
2. Check token di localStorage
3. Try logout dan login lagi

---

## 📚 Documentation

- [Integration Guide](INTEGRATION.md) - Detail tentang integrasi
- [API Documentation](API.md) - Backend API reference
- [README](README.md) - Project overview
- [CHANGELOG](CHANGELOG.md) - Version history

---

## 🎉 Ready!

Jika semua checklist ✅, aplikasi Anda siap digunakan!

**Open:** http://localhost:3000/login

**Login dengan:** admin@test.com / admin123

**Enjoy!** 🚀
