// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Smart Neighborhood',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  DESCRIPTION: 'Aplikasi manajemen komunitas untuk pengelolaan warga, jadwal keamanan, feedback, dan pengumuman',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SECURITY: 'security',
  RESIDENT: 'resident',
} as const;

// Status
export const STATUS = {
  ACTIVE: 'aktif',
  INACTIVE: 'tidak aktif',
} as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

// Shifts
export const SHIFTS = {
  MORNING: 'Pagi',
  AFTERNOON: 'Siang',
  NIGHT: 'Malam',
} as const;

// Shift Times
export const SHIFT_TIMES = {
  MORNING: '06:00 - 12:00',
  AFTERNOON: '12:00 - 18:00',
  NIGHT: '18:00 - 06:00',
} as const;

// Rating Range
export const RATING_RANGE = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 3,
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD MMMM YYYY',
  WITH_TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  RESIDENTS: '/residents',
  RESIDENTS_ADD: '/residents/add',
  SECURITY_SCHEDULE: '/security-schedule',
  FEEDBACK: '/feedback',
  ANNOUNCEMENTS: '/announcements',
} as const;

// Color Palette
export const COLORS = {
  PRIMARY: '#003366',
  PRIMARY_LIGHT: '#004d80',
  PRIMARY_DARK: '#002244',
  SECONDARY: '#FF9500',
  SECONDARY_LIGHT: '#FFB74D',
  SECONDARY_DARK: '#FF8C00',
  ACCENT_GREEN: '#66CC66',
  ACCENT_GOLD: '#FFD700',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
} as const;

// File Upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// Cache Duration (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
} as const;

// Breakpoints (match with Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
