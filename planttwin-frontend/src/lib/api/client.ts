import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const DEFAULT_DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjM1YzRhNi02YzI3LTRmZmEtYjAzZC02YzBiMDA1NDM0MDQiLCJvcmdfaWQiOiI5ODc5M2YxNi02Yjc0LTQ0OWYtYTgzNi01MjE4MWVhZDgyOTMiLCJyb2xlIjoiU1lTVEVNX0FETUlOIiwiZXhwIjoxNzg1NDIwMDM2LCJpYXQiOjE3ODU0MTY0MzYsInR5cGUiOiJhY2Nlc3MifQ.EAZR4ZRg4DE9_bTDNaaglhfFgq-7_b6d8g4uMYzvhKg';

// Request interceptor to attach JWT bearer token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('planttwin_access_token') || DEFAULT_DEV_TOKEN;
  if (config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('planttwin:unauthorized'));
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
