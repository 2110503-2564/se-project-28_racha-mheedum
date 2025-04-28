import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookie-based auth
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token from localStorage if available
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors (no response)
    if (error.message === 'Network Error') {
      console.error('Network error - cannot connect to API');
      // You might want to show a global toast/notification here
    }
    
    // Timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server is not responding');
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Handle unauthorized error (redirect to login, etc.)
      if (typeof document !== 'undefined') { // Change window to document check
        localStorage.removeItem('token');
        
        // Only redirect if not already on the login page to avoid redirect loops
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status);
      // You might want to show a global error notification here
    }

    return Promise.reject(error);
  }
);

export default api;