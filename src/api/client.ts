import axios from 'axios';
import { getAuthHeader, clearAuthHeader } from '@/lib/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://invoice-me.vincentchan.cloud';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically attach Authorization header from sessionStorage
apiClient.interceptors.request.use(
  (config) => {
    const authHeader = getAuthHeader();
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 Unauthorized by clearing auth and redirecting to login
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored credentials
      clearAuthHeader();
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

