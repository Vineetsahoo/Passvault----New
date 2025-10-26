import axios from 'axios';
import notificationService from './notificationService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
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

export interface BackupVersion {
  id: string;
  timestamp: string;
  size: string;
  sizeInBytes: number;
  type: 'auto' | 'manual';
  restorable: boolean;
  itemCount: number;
  dataTypes: string[];
}

export interface BackupSettings {
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number;
  encryption: boolean;
  compression: boolean;
  location: 'cloud' | 'local';
  autoBackupEnabled: boolean;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  lastBackupDate: Date | null;
  itemsBackedUp: number;
  successRate: number;
}

const backupService = {
  // Get all backup versions
  async getBackupVersions() {
    const response = await apiClient.get('/backups');
    return response.data;
  },

  // Create a new backup
  async createBackup(type: 'auto' | 'manual' = 'manual') {
    const response = await apiClient.post('/backups/create', { type });
    // Notification is created by backend
    return response.data;
  },

  // Restore from a backup version
  async restoreBackup(backupId: string) {
    const response = await apiClient.post(`/backups/${backupId}/restore`);
    // Notification is created by backend
    return response.data;
  },

  // Delete a backup version
  async deleteBackup(backupId: string) {
    const response = await apiClient.delete(`/backups/${backupId}`);
    return response.data;
  },

  // Get backup settings
  async getBackupSettings() {
    const response = await apiClient.get('/backups/settings');
    return response.data;
  },

  // Update backup settings
  async updateBackupSettings(settings: Partial<BackupSettings>) {
    const response = await apiClient.put('/backups/settings', settings);
    return response.data;
  },

  // Get backup statistics
  async getBackupStats() {
    const response = await apiClient.get('/backups/stats');
    return response.data;
  },

  // Get backup history
  async getBackupHistory(limit = 10) {
    const response = await apiClient.get(`/backups/history?limit=${limit}`);
    return response.data;
  },

  // Check backup status
  async getBackupStatus(backupId: string) {
    const response = await apiClient.get(`/backups/${backupId}/status`);
    return response.data;
  },

  // Get backup health score
  async getHealthScore() {
    const response = await apiClient.get('/backups/health');
    return response.data;
  },

  // Create selective backup
  async createSelectiveBackup(selectedItems: {
    passwordIds?: string[];
    documentIds?: string[];
    qrcodeIds?: string[];
  }, deviceId?: string) {
    const response = await apiClient.post('/backups/selective', {
      ...selectedItems,
      deviceId
    });
    return response.data;
  },

  // Upload backup to Google Drive
  async uploadToGoogleDrive(backupId: string) {
    const response = await apiClient.post(`/backups/${backupId}/google-drive`);
    return response.data;
  },

  // Verify backup integrity
  async verifyBackup(backupId: string) {
    const response = await apiClient.get(`/backups/${backupId}/verify`);
    return response.data;
  },

  // Get list of devices for backup
  async getDevices() {
    const response = await apiClient.get('/backups/devices/list');
    return response.data;
  },
};

export default backupService;
