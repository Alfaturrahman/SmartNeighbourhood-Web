# API Documentation

Base URL: `http://localhost:8000/api`

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Token {token}
```

### Get Profile
```http
GET /auth/profile
Authorization: Token {token}
```

---

## Residents

### Get All Residents
```http
GET /residents?page=1&limit=10&search=keyword&status=aktif
Authorization: Token {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search keyword
- `status` (optional): Filter by status (aktif/tidak aktif)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "address": "Jl. Mawar No. 10",
      "phone": "08123456789",
      "email": "budi@contoh.com",
      "status": "aktif",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Get Resident by ID
```http
GET /residents/{id}
Authorization: Token {token}
```

### Create Resident
```http
POST /residents
Authorization: Token {token}
Content-Type: application/json

{
  "name": "Budi Santoso",
  "address": "Jl. Mawar No. 10",
  "phone": "08123456789",
  "email": "budi@contoh.com",
  "status": "aktif"
}
```

### Update Resident
```http
PUT /residents/{id}
Authorization: Token {token}
Content-Type: application/json

{
  "name": "Budi Santoso Updated",
  "status": "tidak aktif"
}
```

### Delete Resident
```http
DELETE /residents/{id}
Authorization: Token {token}
```

### Get Resident Statistics
```http
GET /residents/stats
Authorization: Token {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "active": 45,
    "inactive": 5
  }
}
```

---

## Security Schedules

### Get All Schedules
```http
GET /security-schedules?date=2024-01-20&shift=Pagi
Authorization: Token {token}
```

### Create Schedule
```http
POST /security-schedules
Authorization: Token {token}
Content-Type: application/json

{
  "name": "Budi Santoso",
  "shift": "Pagi",
  "date": "2024-01-20",
  "time": "06:00 - 12:00",
  "status": "aktif"
}
```

### Get Today's Schedules
```http
GET /security-schedules/today
Authorization: Token {token}
```

### Get Schedules by Date Range
```http
GET /security-schedules/range?start=2024-01-20&end=2024-01-27
Authorization: Token {token}
```

---

## Feedback

### Get All Feedbacks
```http
GET /feedbacks?rating=5
Authorization: Token {token}
```

### Create Feedback
```http
POST /feedbacks
Authorization: Token {token}
Content-Type: application/json

{
  "title": "Jalan depan berlubang",
  "content": "Jalan gang A sudah berlubang besar...",
  "rating": 3
}
```

### Reply to Feedback
```http
POST /feedbacks/{id}/reply
Authorization: Token {token}
Content-Type: application/json

{
  "reply": "Terima kasih atas laporannya. Akan segera ditindaklanjuti."
}
```

### Get Feedback Statistics
```http
GET /feedbacks/stats
Authorization: Token {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "averageRating": 4.2,
    "byRating": {
      "1": 1,
      "2": 2,
      "3": 5,
      "4": 10,
      "5": 7
    }
  }
}
```

---

## Announcements

### Get All Announcements
```http
GET /announcements?priority=high
Authorization: Token {token}
```

### Create Announcement
```http
POST /announcements
Authorization: Token {token}
Content-Type: application/json

{
  "title": "Pengumuman Pemeliharaan Jalan",
  "content": "Pemeliharaan jalan akan dilakukan...",
  "priority": "high"
}
```

### Get Latest Announcements
```http
GET /announcements/latest?limit=5
Authorization: Token {token}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized - Invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden - You don't have permission"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Authentication Header

All authenticated requests must include the authorization header:

```
Authorization: Token {your-token-here}
```

Example:
```
Authorization: Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per user

If exceeded, you'll receive:
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

---

## Pagination

All list endpoints support pagination:

**Request:**
```http
GET /residents?page=2&limit=20
```

**Response includes:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
