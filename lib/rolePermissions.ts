// Role-based permission system
export type UserRole = 'rw' | 'rt' | 'warga';

export interface Permission {
  // RW-only permissions
  canManageRT: boolean;
  canViewAllRTData: boolean;
  canManageSecurityData: boolean;
  
  // RT-specific permissions
  canManageResidents: boolean;
  canManageAnnouncements: boolean;
  canManageFeedback: boolean;
  
  // Shared/Warga permissions
  canViewResidents: boolean;
  canViewSchedule: boolean;
  canViewAnnouncements: boolean;
  canViewFeedback: boolean;
  canSubmitFeedback: boolean;
  canManageSchedule: boolean;
}

export const rolePermissions: Record<UserRole, Permission> = {
  rw: {
    // RW (Rukun Warga) - Community Head - Full access
    canManageRT: true,
    canViewAllRTData: true,
    canManageSecurityData: true,
    canManageResidents: false, // Only through RT
    canManageAnnouncements: true,
    canManageFeedback: true,
    canViewResidents: true, // Can view their residents
    canViewSchedule: true,
    canViewAnnouncements: true,
    canViewFeedback: true,
    canSubmitFeedback: true,
    canManageSchedule: true,
  },
  rt: {
    // RT (Rukun Tetangga) - Smaller unit head - Limited access
    canManageRT: false,
    canViewAllRTData: false,
    canManageSecurityData: false,
    canManageResidents: true,
    canManageAnnouncements: true,
    canManageFeedback: true,
    canViewResidents: true,
    canViewSchedule: true,
    canViewAnnouncements: true,
    canViewFeedback: true,
    canSubmitFeedback: true, // Can submit own feedback too
    canManageSchedule: false,
  },
  warga: {
    // Warga (Resident) - Minimal access
    canManageRT: false,
    canViewAllRTData: false,
    canManageSecurityData: false,
    canManageResidents: false,
    canManageAnnouncements: false,
    canManageFeedback: true, // Can delete own feedback
    canViewResidents: false,
    canViewSchedule: true,
    canViewAnnouncements: true,
    canViewFeedback: true, // Can view all feedback from their RT
    canSubmitFeedback: true,
    canManageSchedule: false,
  },
};

export const getPermissions = (role?: UserRole | string | null): Permission => {
  // Default to warga if role is invalid or undefined
  const validRole = (role && role in rolePermissions) ? (role as UserRole) : 'warga';
  return rolePermissions[validRole];
};

export const roleLabels: Record<UserRole, string> = {
  rw: 'Rukun Warga',
  rt: 'Rukun Tetangga',
  warga: 'Warga',
};

export const roleIcons: Record<UserRole, string> = {
  rw: '👨‍💼',
  rt: '👷',
  warga: '👤',
};
