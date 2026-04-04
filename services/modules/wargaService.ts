import client from '@/services/api';

export interface WargaCreateData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'aktif' | 'tidak aktif';
  ktp?: string;
  kk?: string;
  jumlah_keluarga?: number;
  kepala_keluarga?: string;
}

export interface Warga {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'aktif' | 'tidak aktif';
  ktp?: string;
  kk?: string;
  jumlah_keluarga?: number;
  kepala_keluarga?: string;
  user: number;
  user_email: string;
  rt: number;
  rt_name: string;
  created_at: string;
  updated_at: string;
}

export const wargaService = {
  // Get all residents
  getAll: async () => {
    try {
      const response = await client.get('/residents/');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Create new resident (RT endpoint)
  create: async (data: WargaCreateData) => {
    try {
      const response = await client.post('/rt/create_resident/', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get single resident
  getById: async (id: number) => {
    try {
      const response = await client.get(`/residents/${id}/`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Update resident
  update: async (id: number, data: Partial<WargaCreateData>) => {
    try {
      const response = await client.put(`/residents/${id}/`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Delete resident
  delete: async (id: number) => {
    try {
      const response = await client.delete(`/residents/${id}/`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Reset resident password
  resetPassword: async (id: number) => {
    try {
      const response = await client.post(`/residents/${id}/reset_password/`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};
