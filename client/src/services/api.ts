import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Clear token and redirect to login
          localStorage.removeItem('accessToken');
          window.location.href = '/signin';
          break;
        case 403:
          console.error('Forbidden:', data.message);
          break;
        case 404:
          console.error('Not found:', data.message);
          break;
        case 429:
          console.error('Rate limit exceeded:', data.message);
          break;
        case 500:
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API error:', data.message || 'Unknown error');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

// Export types for TypeScript
export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

export type PaginatedResponse<T = any> = ApiResponse<{
  items: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}>;

// History API
export const historyAPI = {
  getHistory: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
  }) => api.get('/history', { params }),

  getTimeline: (days: number = 30) => 
    api.get('/history/timeline', { params: { days } }),

  getStats: () => api.get('/history/stats'),

  archiveHistory: (data?: { type?: string; olderThan?: string }) =>
    api.delete('/history', { data }),
};

// Monitoring API
export const monitoringAPI = {
  getDashboard: (period: string = 'week') =>
    api.get('/monitoring/dashboard', { params: { period } }),

  getSecurity: () => api.get('/monitoring/security'),

  getPerformance: () => api.get('/monitoring/performance'),

  getUsage: (period: string = 'month') =>
    api.get('/monitoring/usage', { params: { period } }),

  getAlerts: (params?: { limit?: number; severity?: string }) =>
    api.get('/monitoring/alerts', { params }),
};

// Transactions API
export const transactionsAPI = {
  getTransactions: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
  }) => api.get('/transactions', { params }),

  getStats: (period: string = 'month') =>
    api.get('/transactions/stats', { params: { period } }),

  getTransaction: (id: string) => api.get(`/transactions/${id}`),

  createTransaction: (data: {
    type: string;
    amount: number;
    currency?: string;
    description: string;
    status?: string;
    paymentMethod?: string;
  }) => api.post('/transactions', data),

  exportCSV: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/transactions/export/csv', { 
      params,
      responseType: 'blob'
    }),

  getReceipt: (id: string) => api.get(`/transactions/receipt/${id}`),
};

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  getMe: () => api.get('/auth/me'),
  verifyToken: () => api.get('/auth/verify-token'),
  refreshToken: () => api.post('/auth/refresh'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData: any) => api.put('/user/profile', profileData),
  changePassword: (passwordData: any) => api.put('/user/password', passwordData),
  deleteAccount: (deleteData: any) => api.delete('/user/account', { data: deleteData }),
  getStats: () => api.get('/user/stats'),
  revokeSessions: () => api.post('/user/sessions/revoke'),
};

// Password API
export const passwordAPI = {
  getPasswords: (params?: any) => api.get('/passwords', { params }),
  getPassword: (id: string) => api.get(`/passwords/${id}`),
  createPassword: (passwordData: any) => api.post('/passwords', passwordData),
  updatePassword: (id: string, passwordData: any) => api.put(`/passwords/${id}`, passwordData),
  deletePassword: (id: string) => api.delete(`/passwords/${id}`),
  getStats: () => api.get('/passwords/categories/stats'),
  getExpiring: (days: number = 30) => api.get('/passwords/expiring/soon', { params: { days } }),
  toggleFavorite: (id: string) => api.post(`/passwords/${id}/favorite`),
  markCompromised: (id: string) => api.post(`/passwords/${id}/compromised`),
};

// Utility functions
export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return !!(token && isAuthenticated);
};

export const getStoredUser = (): any => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const clearAuthData = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userData');
  localStorage.removeItem('mockAuth');
  localStorage.removeItem('userToken');
  localStorage.removeItem('mockUser');
};

export const setAuthData = (authData: any): void => {
  localStorage.setItem('accessToken', authData.accessToken);
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userData', JSON.stringify(authData.user));
};
