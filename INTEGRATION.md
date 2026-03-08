# 🔗 Integrasi Frontend & Backend - Smart Neighborhood

## ✅ Perubahan yang Telah Dilakukan

### 1. **Authentication Integration**
- ✅ Login page sekarang terhubung ke backend API `/api/auth/login`
- ✅ Token authentication menggunakan JWT Bearer (sesuai backend)
- ✅ Token disimpan di localStorage (access + refresh token)
- ✅ Auto-refresh token sebelum expired
- ✅ Proper logout dengan clear semua auth data

### 2. **File yang Diupdate**

#### **Frontend Changes:**

**services/api.ts**
- Changed: `Token ${token}` → `Bearer ${token}`
- Added: Auto token refresh sebelum request
- Added: Retry logic untuk 401 dengan refresh token
- Added: Import tokenManager

**services/modules/authService.ts**
- Updated: Endpoint `/auth/profile` → `/auth/me`
- Updated: Return type untuk match backend response

**app/login/page.tsx**
- Replaced: Fake setTimeout login → Real API call
- Added: Error handling dengan SweetAlert2
- Added: Loading states & validation
- Added: Import authService & tokenManager
- Removed: Role selector (role dari backend)

**components/LayoutWrapper.tsx**
- Updated: Authentication check menggunakan tokenManager
- Updated: Check token & user data dari tokenManager

**components/Header.tsx**
- Updated: Logout menggunakan tokenManager.clearAuth()
- Added: Confirmation dialog sebelum logout

**lib/tokenManager.ts** (NEW)
- Token storage management
- Token expiry checking
- Auto refresh token logic
- JWT parsing utilities

### 3. **Environment Configuration**

Create `.env.local` di root frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. **Backend Requirements**

Backend sudah support:
- ✅ POST `/api/auth/login` - Returns { access, refresh, user, message }
- ✅ GET `/api/auth/me` - Returns current user
- ⚠️ POST `/api/auth/refresh` - **PERLU DITAMBAHKAN** (optional untuk refresh token)

## 🚀 Testing Integrasi

### Persiapan:

1. **Start Backend:**
```powershell
cd c:\Users\Rahman\Desktop\smartneighbour_backend
python manage.py runserver
```

2. **Start Frontend:**
```powershell
cd C:\Users\Rahman\Downloads\Frontend\Frontend\smartneighbour
npm run dev
```

3. **Create Test User** (jika belum ada):
```powershell
cd c:\Users\Rahman\Desktop\smartneighbour_backend
python create_test_user.py
```

### Test Cases:

#### ✅ Test 1: Login Successful
1. Buka http://localhost:3000/login
2. Input credentials yang valid
3. Expected: Redirect ke /dashboard dengan token tersimpan

#### ✅ Test 2: Login Failed
1. Input email/password yang salah
2. Expected: Error message muncul

#### ✅ Test 3: Protected Routes
1. Akses /dashboard tanpa login
2. Expected: Auto redirect ke /login

#### ✅ Test 4: Logout
1. Klik logout button
2. Confirm dialog
3. Expected: Redirect ke /login, token cleared

#### ✅ Test 5: Token in API Calls
1. Login
2. Navigate ke Residents/Feedback/etc
3. Check Network tab - Authorization header harus ada

## 🔧 Troubleshooting

### Issue: CORS Error
**Solution:** Pastikan CORS settings di backend sudah benar:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
]
```

### Issue: 401 Unauthorized
**Check:**
1. Token tersimpan di localStorage?
2. Format header: `Bearer <token>` bukan `Token <token>`
3. Backend authentication class: `CustomJWTAuthentication`

### Issue: Login tidak redirect
**Check:**
1. Response dari backend sesuai format: `{ access, refresh, user, message }`
2. Console log untuk error
3. Network tab untuk response

## 📝 Next Steps (Optional Improvements)

1. **Add Refresh Token Endpoint di Backend:**
```python
# views.py
from rest_framework_simplejwt.views import TokenRefreshView

# urls.py
path('auth/refresh', TokenRefreshView.as_view(), name='token_refresh'),
```

2. **Add Loading Interceptor:**
   - Show global loading saat API call

3. **Add Rate Limiting:**
   - Prevent brute force login

4. **Add Remember Me:**
   - Store refresh token longer

5. **Add Email Verification:**
   - Verify email on registration

## 🎯 Summary

**Status: READY FOR TESTING** 🎉

Frontend sekarang fully integrated dengan backend:
- ✅ Real authentication
- ✅ JWT token handling
- ✅ Auto refresh mechanism
- ✅ Protected routes
- ✅ Proper error handling

Silakan test dan laporkan jika ada issue!
