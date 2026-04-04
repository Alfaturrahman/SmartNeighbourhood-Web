import { getData, postData, updateData, deleteData } from '../api';
import type { Feedback, FeedbackFormData, ApiResponse } from '@/types';

export const feedbackService = {
  /**
   * Get all feedbacks
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    rating?: number;
  }): Promise<ApiResponse<Feedback[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.rating) queryParams.append('rating', params.rating.toString());

    const endpoint = `/feedbacks/${queryParams.toString() ? `?${queryParams}` : ''}`;
    return getData<ApiResponse<Feedback[]>>(endpoint);
  },

  /**
   * Get feedback by ID
   */
  async getById(id: number): Promise<ApiResponse<Feedback>> {
    return getData<ApiResponse<Feedback>>(`/feedbacks/${id}/`);
  },

  /**
   * Create new feedback
   */
  async create(data: FeedbackFormData): Promise<ApiResponse<Feedback>> {
    return postData<ApiResponse<Feedback>>('/feedbacks/', data);
  },

  /**
   * Reply to feedback
   */
  async reply(id: number, reply: string, replied_by?: string): Promise<ApiResponse<Feedback>> {
    return postData<ApiResponse<Feedback>>(`/feedbacks/${id}/reply/`, { 
      reply,
      replied_by: replied_by || 'Admin'
    });
  },

  /**
   * Respond to feedback (alias for reply)
   */
  async respond(id: number, response: string, responded_by?: string): Promise<ApiResponse<Feedback>> {
    return this.reply(id, response, responded_by);
  },

  /**
   * Delete feedback
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    return deleteData<ApiResponse<void>>(`/feedbacks/${id}/`);
  },

  /**
   * Get feedback statistics
   */
  async getStats(): Promise<ApiResponse<{
    total: number;
    averageRating: number;
    byRating: Record<number, number>;
  }>> {
    return getData<ApiResponse<any>>('/feedbacks/stats/');
  },
};
