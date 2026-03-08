import { getData, postData, updateData, deleteData } from '../api';
import type { User, ApiResponse } from '@/types';

export const authService = {
  /**
   * Login user
   */
  async login(email: string, password: string): Promise<any> {
    return postData<any>('/auth/login/', { email, password });
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    return postData<ApiResponse<void>>('/auth/logout/', {});
  },

  /**
   * Register new user
   */
  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }): Promise<ApiResponse<User>> {
    return postData<ApiResponse<User>>('/auth/register/', userData);
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<any> {
    return getData<any>('/auth/me/');
  },

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return updateData<ApiResponse<User>>('/auth/profile/', userData);
  },

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return postData<ApiResponse<void>>('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return postData<ApiResponse<void>>('/auth/forgot-password/', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return postData<ApiResponse<void>>('/auth/reset-password/', {
      token,
      new_password: newPassword,
    });
  },
};
