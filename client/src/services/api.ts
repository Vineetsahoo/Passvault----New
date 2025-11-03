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
      const { status, data, config } = error.response;

      // Skip logging 404 errors for terminal-qr endpoints (expected when sessions are cleaned up)
      const isTerminalQrEndpoint = config?.url?.includes('terminal-qr');
      const is404 = status === 404;

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
          // Don't log 404s for terminal-qr endpoints (sessions get cleaned up)
          if (!isTerminalQrEndpoint) {
            console.error('Not found:', data.message);
          }
          break;
        case 410:
          // Gone - Resource no longer available (used for expired sessions)
          if (!isTerminalQrEndpoint) {
            console.error('Resource expired:', data.message);
          }
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

// Sharing API
export const sharingAPI = {
  // Share passes
  sharePass: (data: {
    passId: string;
    recipientEmail: string;
    recipientName?: string;
    accessLevel: 'read' | 'edit';
    expiryDays?: number;
    restrictions?: string[];
    templateId?: string;
    message?: string;
  }) => api.post('/sharing/share', data),

  batchShare: (data: {
    passId: string;
    recipients: Array<{ email: string; name?: string }>;
    accessLevel: 'read' | 'edit';
    expiryDays?: number;
    templateId?: string;
  }) => api.post('/sharing/batch-share', data),

  generateLink: (data: {
    passId: string;
    accessLevel: 'read' | 'edit';
    expiryHours?: number;
    maxUses?: number;
  }) => api.post('/sharing/generate-link', data),

  // Get shares
  getMyShares: (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'active' | 'revoked' | 'expired';
    search?: string;
  }) => api.get('/sharing/my-shares', { params }),

  getSharedWithMe: () => api.get('/sharing/shared-with-me'),

  // Manage shares
  updateShare: (id: string, data: {
    accessLevel?: 'read' | 'edit';
    restrictions?: string[];
    expiryDays?: number;
  }) => api.put(`/sharing/${id}`, data),

  revokeAccess: (id: string, reason?: string) =>
    api.delete(`/sharing/${id}/revoke`, { data: { reason } }),

  // Templates
  getTemplates: () => api.get('/sharing/templates'),

  createTemplate: (data: {
    name: string;
    description?: string;
    accessLevel: 'read' | 'edit';
    expiryDays: number;
    restrictions?: string[];
  }) => api.post('/sharing/templates', data),

  updateTemplate: (id: string, data: any) =>
    api.put(`/sharing/templates/${id}`, data),

  deleteTemplate: (id: string) => api.delete(`/sharing/templates/${id}`),

  // Logs and stats
  getLogs: (params?: {
    page?: number;
    limit?: number;
    action?: string;
  }) => api.get('/sharing/logs', { params }),

  getStats: () => api.get('/sharing/stats'),
};

// QR Codes / Passes API
export const qrCodesAPI = {
  getCodes: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
  }) => api.get('/qrcodes', { params }),

  getCode: (id: string) => api.get(`/qrcodes/${id}`),

  createCode: (data: {
    type: string;
    title: string;
    cardNumber?: string;
    holderName?: string;
    expiryDate?: string;
    cvv?: string;
    passId?: string;
    category?: string;
    notes?: string;
  }) => api.post('/qrcodes', data),

  updateCode: (id: string, data: any) => api.put(`/qrcodes/${id}`, data),

  deleteCode: (id: string) => api.delete(`/qrcodes/${id}`),

  generateQR: (id: string) => api.get(`/qrcodes/${id}/generate`),
};

// Terminal QR API
export const terminalQrAPI = {
  // Generate a new terminal QR session
  generateSession: (data: {
    passType: string;
    passData: any;
    expirySeconds?: number;
  }) => api.post('/terminal-qr/generate', data),

  // Check status of a session (for polling)
  getSessionStatus: (sessionId: string) => 
    api.get(`/terminal-qr/status/${sessionId}`),

  // Process a scanned QR code
  scanQRCode: (qrData: string | object) => 
    api.post('/terminal-qr/scan', { qrData }),

  // Cancel an active session
  cancelSession: (sessionId: string) => 
    api.delete(`/terminal-qr/cancel/${sessionId}`),

  // Get all active sessions for current user
  getActiveSessions: () => api.get('/terminal-qr/sessions'),
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
