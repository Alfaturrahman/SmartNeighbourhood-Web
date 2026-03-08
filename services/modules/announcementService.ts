import { getData, postData, updateData, deleteData } from '../api';
import type { Announcement, AnnouncementFormData, ApiResponse } from '@/types';

export const announcementService = {
  /**
   * Get all announcements
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    priority?: string;
  }): Promise<ApiResponse<Announcement[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.priority) queryParams.append('priority', params.priority);

    const endpoint = `/announcements/${queryParams.toString() ? `?${queryParams}` : ''}`;
    return getData<ApiResponse<Announcement[]>>(endpoint);
  },

  /**
   * Get announcement by ID
   */
  async getById(id: number): Promise<ApiResponse<Announcement>> {
    return getData<ApiResponse<Announcement>>(`/announcements/${id}/`);
  },

  /**
   * Create new announcement
   */
  async create(data: AnnouncementFormData): Promise<ApiResponse<Announcement>> {
    return postData<ApiResponse<Announcement>>('/announcements/', data);
  },

  /**
   * Update announcement
   */
  async update(id: number, data: Partial<AnnouncementFormData>): Promise<ApiResponse<Announcement>> {
    return updateData<ApiResponse<Announcement>>(`/announcements/${id}/`, data);
  },

  /**
   * Delete announcement
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return deleteData<ApiResponse<void>>(`/announcements/${id}/`);
  },

  /**
   * Get latest announcements
   */
  async getLatest(limit: number = 5): Promise<ApiResponse<Announcement[]>> {
    return getData<ApiResponse<Announcement[]>>(`/announcements/latest/?limit=${limit}`);
  },
};
