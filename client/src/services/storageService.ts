import axios from 'axios';
import notificationService from './notificationService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export interface StorageMetrics {
  totalStorage: string;
  totalStorageBytes: number;
  usedStorage: string;
  usedStorageBytes: number;
  availableStorage: string;
  availableStorageBytes: number;
  encryptedFiles: number;
  lastBackup: Date | null;
  usagePercentage: number;
}

export interface SecurityStatus {
  status: 'secure' | 'warning' | 'critical';
  lastScan: Date;
  encryptionType: string;
  twoFactorEnabled: boolean;
  vulnerabilities: number;
}

export interface SecurityAudit {
  id: string;
  timestamp: Date;
  action: string;
  ipAddress: string;
  location: string;
  status: 'success' | 'failed';
  deviceName?: string;
}

export interface BackupStatus {
  lastBackup: Date | null;
  nextScheduled: Date | null;
  backupSize: string;
  location: string;
  autoBackupEnabled: boolean;
}

const storageService = {
  // Get storage metrics
  async getStorageMetrics() {
    const response = await apiClient.get('/storage/metrics');
    
    // Check for storage alerts
    const metrics = response.data.metrics || response.data;
    if (metrics.usagePercentage >= 80) {
      try {
        await notificationService.notifyStorageAlert(metrics.usagePercentage);
      } catch (err) {
        console.error('Failed to send storage alert notification:', err);
      }
    }
    
    return response.data;
  },

  // Get security status
  async getSecurityStatus() {
    const response = await apiClient.get('/storage/security-status');
    return response.data;
  },

  // Get security audit log
  async getSecurityAuditLog(limit = 10) {
    const response = await apiClient.get('/storage/audit-log', { params: { limit } });
    return response.data;
  },

  // Get backup status
  async getBackupStatus() {
    const response = await apiClient.get('/storage/backup-status');
    return response.data;
  },

  // Get recovery key
  async getRecoveryKey() {
    const response = await apiClient.get('/storage/recovery-key');
    return response.data;
  },

  // Regenerate recovery key
  async regenerateRecoveryKey() {
    const response = await apiClient.post('/storage/recovery-key/regenerate');
    return response.data;
  },

  // Run security scan
  async runSecurityScan() {
    const response = await apiClient.post('/storage/security-scan');
    
    // Send notification after scan completes
    if (response.data.success) {
      const status = response.data.status || 'secure';
      try {
        await notificationService.notifySecurityScanCompleted(status);
      } catch (err) {
        console.error('Failed to send security scan notification:', err);
      }
    }
    
    return response.data;
  },

  // Get encryption settings
  async getEncryptionSettings() {
    const response = await apiClient.get('/storage/encryption-settings');
    return response.data;
  },

  // Update encryption settings
  async updateEncryptionSettings(settings: {
    encryptionType?: string;
    autoEncrypt?: boolean;
  }) {
    const response = await apiClient.put('/storage/encryption-settings', settings);
    return response.data;
  },

  // Export all data
  async exportData() {
    const response = await apiClient.get('/storage/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Calculate storage usage breakdown
  async getStorageBreakdown() {
    const response = await apiClient.get('/storage/breakdown');
    return response.data;
  },

  // Format bytes to human readable
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },
};

export default storageService;
