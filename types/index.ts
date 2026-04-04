// User and Authentication Types
export interface User {
  id?: number;
  email: string;
  name?: string;
  role: UserRole;
  token?: string;
}

export type UserRole = 'admin' | 'security' | 'resident';

// Resident Types
export interface Resident {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'aktif' | 'tidak aktif';
  createdAt?: string;
  updatedAt?: string;
}

export interface ResidentFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'aktif' | 'tidak aktif';
}

// Feedback Types
export interface Feedback {
  id: number;
  author: string;
  title: string;
  content: string;
  rating?: number;
  date: string;
  reply?: string;
  replied_at?: string;  // Changed from repliedAt to match API
  replied_by?: string;  // Changed from repliedBy to match API
}

export interface FeedbackFormData {
  title: string;
  content: string;
  rating?: number;  // Made optional since we removed rating from form
}

// Announcement Types
export interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  createdAt?: string;
  updatedAt?: string;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

// Security Schedule Types
export interface SecuritySchedule {
  id: number;
  name: string;
  shift: 'Pagi' | 'Siang' | 'Malam';
  schedule_type: 'daily' | 'weekly' | 'monthly';
  date?: string;
  start_date?: string;
  end_date?: string;
  weekday?: number;
  month_day?: number;
  time: string;
  status: 'aktif' | 'tidak aktif';
  notes?: string;
  personnel?: number;
  personnel_name?: string;
  personnel_phone?: string;
  personnel_email?: string;
}

export interface SecurityScheduleFormData {
  name: string;
  shift: 'Pagi' | 'Siang' | 'Malam';
  schedule_type: 'daily' | 'weekly' | 'monthly';
  date?: string;
  start_date?: string;
  end_date?: string;
  weekday?: number;
  month_day?: number;
  time: string;
  status: 'aktif' | 'tidak aktif';
  notes?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalResidents: number;
  activeResidents: number;
  inactiveResidents: number;
  totalFeedbacks: number;
  totalAnnouncements: number;
  totalSchedules: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  // Django REST Framework pagination fields
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// Modal Props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

// Component Props
export interface SearchableListProps<T> {
  items: T[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
}
