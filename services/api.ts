import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { tokenManager } from '@/lib/tokenManager';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor - attach token and handle refresh
client.interceptors.request.use(
  async (config) => {
    console.log('🔵 Request interceptor:', config.url);
    
    // Skip token logic for auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/login') || 
                          config.url?.includes('/auth/register') ||
                          config.url?.includes('/auth/refresh');
    
    if (typeof window !== 'undefined' && !isAuthEndpoint) {
      try {
        // Check if token needs refresh before making request
        if (tokenManager.needsRefresh()) {
          console.log('🟡 Token needs refresh');
          await tokenManager.refreshAccessToken();
        }

        const token = tokenManager.getToken();
        if (token) {
          config.headers = config.headers ?? {};
          config.headers['Authorization'] = `Bearer ${token}`;
          console.log('🟢 Token attached');
        }
      } catch (err) {
        console.error('🔴 Error in request interceptor:', err);
        // Don't block the request, just log the error
      }
    } else {
      console.log('⚪ Skipping token for auth endpoint');
    }
    
    return config;
  },
  (error) => {
    console.error('🔴 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      
      if (status === 401) {
        // Unauthorized - try to refresh token once
        const originalRequest: any = error.config;
        
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          
          const refreshed = await tokenManager.refreshAccessToken();
          if (refreshed) {
            // Retry the original request with new token
            const token = tokenManager.getToken();
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return client(originalRequest);
          }
        }
        
        // If refresh failed or already retried, clear auth and redirect
        tokenManager.clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        console.error('Forbidden - You do not have permission');
      } else if (status >= 500) {
        console.error('Server error - Please try again later');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error - Please check your connection');
    }
    
    return Promise.reject(error);
  }
);

// Retry logic helper
async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
}

// Generic GET request with retry
export const getData = async <T = any>(
  endpoint: string,
  config?: AxiosRequestConfig,
  withRetry = true
): Promise<T> => {
  const request = () => client.get<T>(endpoint, config).then(res => res.data);
  
  try {
    return withRetry ? await retryRequest(request) : await request();
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

// Generic POST request
export const postData = async <T = any>(
  endpoint: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const res = await client.post<T>(endpoint, data, config);
    return res.data;
  } catch (error) {
    console.error(`Error posting data to ${endpoint}:`, error);
    throw error;
  }
};

// Generic PUT request
export const updateData = async <T = any>(
  endpoint: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const res = await client.put<T>(endpoint, data, config);
    return res.data;
  } catch (error) {
    console.error(`Error updating data at ${endpoint}:`, error);
    throw error;
  }
};

// Generic PATCH request
export const patchData = async <T = any>(
  endpoint: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const res = await client.patch<T>(endpoint, data, config);
    return res.data;
  } catch (error) {
    console.error(`Error patching data at ${endpoint}:`, error);
    throw error;
  }
};

// Generic DELETE request
export const deleteData = async <T = any>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const res = await client.delete<T>(endpoint, config);
    return res.data;
  } catch (error) {
    console.error(`Error deleting data at ${endpoint}:`, error);
    throw error;
  }
};

// Upload file with progress
export const uploadFile = async (
  endpoint: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await client.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return res.data;
  } catch (error) {
    console.error(`Error uploading file to ${endpoint}:`, error);
    throw error;
  }
};

export default client;
