// Role-based permission system
export type UserRole = 'admin' | 'security' | 'resident';

export interface Permission {
  canViewResidents: boolean;
  canManageResidents: boolean;
  canViewSchedule: boolean;
  canManageSchedule: boolean;
  canViewAnnouncements: boolean;
  canManageAnnouncements: boolean;
  canViewFeedback: boolean;
  canManageFeedback: boolean;
  canSubmitReports: boolean;
  canViewReports: boolean;
  canSubmitFeedback: boolean;
}

export const rolePermissions: Record<UserRole, Permission> = {
  admin: {
    // RT/RW - Full access
    canViewResidents: true,
    canManageResidents: true,
    canViewSchedule: true,
    canManageSchedule: true,
    canViewAnnouncements: true,
    canManageAnnouncements: true,
    canViewFeedback: true,
    canManageFeedback: true,
    canSubmitReports: false,
    canViewReports: true,
    canSubmitFeedback: false,
  },
  security: {
    // Security - Limited access
    canViewResidents: false,
    canManageResidents: false,
    canViewSchedule: true,
    canManageSchedule: false,
    canViewAnnouncements: true,
    canManageAnnouncements: false,
    canViewFeedback: false,
    canManageFeedback: false,
    canSubmitReports: true,
    canViewReports: false,
    canSubmitFeedback: false,
  },
  resident: {
    // Warga - Minimal access
    canViewResidents: false,
    canManageResidents: false,
    canViewSchedule: true,
    canManageSchedule: false,
    canViewAnnouncements: true,
    canManageAnnouncements: false,
    canViewFeedback: false,
    canManageFeedback: false,
    canSubmitReports: false,
    canViewReports: false,
    canSubmitFeedback: true,
  },
};

export const getPermissions = (role: UserRole): Permission => {
  return rolePermissions[role];
};

export const roleLabels: Record<UserRole, string> = {
  admin: 'RT/RW',
  security: 'Keamanan',
  resident: 'Warga',
};

export const roleIcons: Record<UserRole, string> = {
  admin: '👨‍💼',
  security: '🔐',
  resident: '👤',
};
