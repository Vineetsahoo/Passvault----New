import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Logout from all devices
  logoutAll: async () => {
    const response = await api.post('/auth/logout-all');
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Verify token
  verifyToken: async () => {
    const response = await api.get('/auth/verify-token');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

// User API methods
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/user/password', passwordData);
    return response.data;
  },

  // Delete account
  deleteAccount: async (deleteData) => {
    const response = await api.delete('/user/account', { data: deleteData });
    return response.data;
  },

  // Get user statistics
  getStats: async () => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  // Revoke sessions
  revokeSessions: async () => {
    const response = await api.post('/user/sessions/revoke');
    return response.data;
  },
};

// Password API methods
export const passwordAPI = {
  // Get all passwords
  getPasswords: async (params = {}) => {
    const response = await api.get('/passwords', { params });
    return response.data;
  },

  // Get single password
  getPassword: async (id) => {
    const response = await api.get(`/passwords/${id}`);
    return response.data;
  },

  // Create new password
  createPassword: async (passwordData) => {
    const response = await api.post('/passwords', passwordData);
    return response.data;
  },

  // Update password
  updatePassword: async (id, passwordData) => {
    const response = await api.put(`/passwords/${id}`, passwordData);
    return response.data;
  },

  // Delete password
  deletePassword: async (id) => {
    const response = await api.delete(`/passwords/${id}`);
    return response.data;
  },

  // Get password statistics
  getStats: async () => {
    const response = await api.get('/passwords/categories/stats');
    return response.data;
  },

  // Get expiring passwords
  getExpiring: async (days = 30) => {
    const response = await api.get('/passwords/expiring/soon', {
      params: { days }
    });
    return response.data;
  },

  // Toggle favorite
  toggleFavorite: async (id) => {
    const response = await api.post(`/passwords/${id}/favorite`);
    return response.data;
  },

  // Mark as compromised
  markCompromised: async (id) => {
    const response = await api.post(`/passwords/${id}/compromised`);
    return response.data;
  },
};

// Utility functions
export const isLoggedIn = () => {
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return !!(token && isAuthenticated);
};

export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userData');
  localStorage.removeItem('mockAuth');
  localStorage.removeItem('userToken');
  localStorage.removeItem('mockUser');
};

export const setAuthData = (authData) => {
  localStorage.setItem('accessToken', authData.accessToken);
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userData', JSON.stringify(authData.user));
};

export default api;