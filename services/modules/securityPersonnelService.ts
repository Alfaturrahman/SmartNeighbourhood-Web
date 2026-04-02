import { getData, postData, patchData, deleteData } from '../api';

export const securityPersonnelService = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/security-personnel/${queryParams.toString() ? `?${queryParams}` : ''}`;
    return getData(endpoint);
  },

  getById: async (id: number) => {
    return getData(`/security-personnel/${id}/`);
  },

  create: async (data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    area?: string;
    status: 'aktif' | 'tidak aktif';
    notes?: string;
  }) => {
    return postData('/security-personnel/', data);
  },

  update: async (id: number, data: Partial<{
    name: string;
    phone: string;
    email: string;
    address: string;
    area: string;
    status: 'aktif' | 'tidak aktif';
    notes: string;
  }>) => {
    return patchData(`/security-personnel/${id}/`, data);
  },

  delete: async (id: number) => {
    return deleteData(`/security-personnel/${id}/`);
  },
};
