import { getData, postData, updateData, deleteData } from '../api';
import type { Resident, ResidentFormData, ApiResponse } from '@/types';

export const residentService = {
  /**
   * Get all residents
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<Resident[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/residents/${queryParams.toString() ? `?${queryParams}` : ''}`;
    return getData<ApiResponse<Resident[]>>(endpoint);
  },

  /**
   * Get resident by ID
   */
  async getById(id: number): Promise<ApiResponse<Resident>> {
    return getData<ApiResponse<Resident>>(`/residents/${id}/`);
  },

  /**
   * Create new resident
   */
  async create(data: ResidentFormData): Promise<ApiResponse<Resident>> {
    return postData<ApiResponse<Resident>>('/residents/', data);
  },

  /**
   * Update resident
   */
  async update(id: number, data: Partial<ResidentFormData>): Promise<ApiResponse<Resident>> {
    return updateData<ApiResponse<Resident>>(`/residents/${id}/`, data);
  },

  /**
   * Delete resident
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return deleteData<ApiResponse<void>>(`/residents/${id}/`);
  },

  /**
   * Get resident statistics
   */
  async getStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
  }>> {
    return getData<ApiResponse<any>>('/residents/stats/');
  },
};
