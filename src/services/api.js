import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – attach JWT
api.interceptors.request.use(
  (config) => {
    // Read token from localStorage (or get from auth context – but context not avail here)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – retry logic + error mapping
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Retry on 5xx errors (up to 1 retry)
    if (
      error.response &&
      error.response.status >= 500 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return api(originalRequest);
    }

    // Normalize error
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Something went wrong. Please try again.';

    // Global toast for auth errors (except during login/register)
    if (error.response?.status === 401 && !originalRequest.url.includes('/auth')) {
      // Optionally redirect to login
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;
