import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage when running in browser
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Token ${token}`;
    }
  }
  return config;
});

export const getData = async (endpoint: string) => {
  try {
    const res = await client.get(endpoint);
    return res.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const postData = async (endpoint: string, data: any) => {
  try {
    const res = await client.post(endpoint, data);
    return res.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};

export const updateData = async (endpoint: string, data: any) => {
  try {
    const res = await client.put(endpoint, data);
    return res.data;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
};

export const deleteData = async (endpoint: string) => {
  try {
    const res = await client.delete(endpoint);
    return res.data;
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
};

export default client;
