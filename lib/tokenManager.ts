/**
 * Token Manager
 * Handles JWT token storage, refresh, and validation
 */

import { authService } from '@/services/modules/authService';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const tokenManager = {
  /**
   * Get access token from localStorage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Set tokens in localStorage
   */
  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  /**
   * Set user data in localStorage
   */
  setUser(userData: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  },

  /**
   * Get user data from localStorage
   */
  getUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Clear all auth data
   */
  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  },

  /**
   * Parse JWT token to get payload
   */
  parseToken(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const payload = this.parseToken(token);
    if (!payload || !payload.exp) return true;
    
    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    // Add 1 minute buffer before actual expiration
    return currentTime >= expirationTime - 60000;
  },

  /**
   * Check if token needs refresh (expires in less than 5 minutes)
   */
  needsRefresh(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = this.parseToken(token);
    if (!payload || !payload.exp) return true;

    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    return expirationTime - currentTime < fiveMinutes;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call refresh endpoint (you'll need to implement this in backend)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/refresh/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      if (data.access) {
        localStorage.setItem(TOKEN_KEY, data.access);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearAuth();
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return false;
    }
  },
};
