import client from '@/services/api';

export interface RTCreateData {
  name: string;
  email: string;
  phone?: string;
  area?: string;
  address?: string;
}

export interface RT {
  id: number;
  name: string;
  user_email: string;
  rw: number;
  rw_name: string;
  area: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export const rtService = {
  // Get all RT (for RW)
  getAll: async () => {
    try {
      const response = await client.get('/rt/');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Create new RT (RW endpoint)
  create: async (data: RTCreateData) => {
    try {
      const response = await client.post('/rw/create_rt/', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get single RT
  getById: async (id: number) => {
    try {
      const response = await client.get(`/rt/${id}/`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Update RT
  update: async (id: number, data: Partial<RTCreateData>) => {
    try {
      const response = await client.put(`/rt/${id}/`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Delete RT
  delete: async (id: number) => {
    try {
      const response = await client.delete(`/rt/${id}/`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Reset RT password
  resetPassword: async (id: number) => {
    try {
      const response = await client.post(`/rw/${id}/reset_password/`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};
