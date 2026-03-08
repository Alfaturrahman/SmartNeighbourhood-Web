import { getData, postData, updateData, deleteData } from '../api';
import type { SecuritySchedule, SecurityScheduleFormData, ApiResponse } from '@/types';

export const securityScheduleService = {
  /**
   * Get all schedules
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    date?: string;
    shift?: string;
  }): Promise<ApiResponse<SecuritySchedule[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.date) queryParams.append('date', params.date);
    if (params?.shift) queryParams.append('shift', params.shift);

    const endpoint = `/security-schedules/${queryParams.toString() ? `?${queryParams}` : ''}`;
    return getData<ApiResponse<SecuritySchedule[]>>(endpoint);
  },

  /**
   * Get schedule by ID
   */
  async getById(id: number): Promise<ApiResponse<SecuritySchedule>> {
    return getData<ApiResponse<SecuritySchedule>>(`/security-schedules/${id}/`);
  },

  /**
   * Create new schedule
   */
  async create(data: SecurityScheduleFormData): Promise<ApiResponse<SecuritySchedule>> {
    return postData<ApiResponse<SecuritySchedule>>('/security-schedules/', data);
  },

  /**
   * Update schedule
   */
  async update(id: number, data: Partial<SecurityScheduleFormData>): Promise<ApiResponse<SecuritySchedule>> {
    return updateData<ApiResponse<SecuritySchedule>>(`/security-schedules/${id}/`, data);
  },

  /**
   * Delete schedule
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return deleteData<ApiResponse<void>>(`/security-schedules/${id}/`);
  },

  /**
   * Get schedules for today
   */
  async getToday(): Promise<ApiResponse<SecuritySchedule[]>> {
    return getData<ApiResponse<SecuritySchedule[]>>('/security-schedules/today/');
  },

  /**
   * Get schedules for a date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<ApiResponse<SecuritySchedule[]>> {
    return getData<ApiResponse<SecuritySchedule[]>>(
      `/security-schedules/range/?start=${startDate}&end=${endDate}`
    );
  },
};
