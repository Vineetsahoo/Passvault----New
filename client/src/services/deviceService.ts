import api from './api';
import notificationService from './notificationService';

export interface Device {
  _id: string;
  userId: string;
  deviceName: string;
  deviceType: 'laptop' | 'mobile' | 'tablet' | 'desktop';
  deviceId: string;
  operatingSystem: string;
  browser: string;
  ipAddress: string;
  location?: {
    city?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status: 'online' | 'offline' | 'syncing';
  lastSyncedAt?: Date;
  lastActiveAt: Date;
  syncEnabled: boolean;
  autoSyncEnabled: boolean;
  syncSettings: {
    passwords: boolean;
    documents: boolean;
    settings: boolean;
    notes: boolean;
  };
  isTrusted: boolean;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
  verificationMethod?: 'email' | 'manual' | 'qr' | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDeviceData {
  deviceName: string;
  deviceType: 'laptop' | 'mobile' | 'tablet' | 'desktop';
  operatingSystem: string;
  browser: string;
  location?: {
    city?: string;
    country?: string;
  };
}

export interface DeviceFilters {
  status?: 'online' | 'offline' | 'syncing';
  sortBy?: string;
}

export interface DeviceStats {
  total: number;
  online: number;
  offline: number;
  statusBreakdown: { _id: string; count: number }[];
  typeBreakdown: { _id: string; count: number }[];
  recentActivity: Device[];
  syncStats: {
    avgSyncEnabled: number;
    trustedDevices: number;
  };
}

const deviceService = {
  // Register device
  async registerDevice(data: RegisterDeviceData): Promise<Device> {
    const response = await api.post('/devices/register', data);
    // Notification is created by backend
    return response.data.device;
  },

  // Get all devices
  async getDevices(filters: DeviceFilters = {}): Promise<{
    devices: Device[];
    stats: {
      total: number;
      online: number;
      offline: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await api.get(`/devices?${params.toString()}`);
    return response.data;
  },

  // Get single device
  async getDevice(id: string): Promise<{
    device: Device;
    recentSyncs: any[];
  }> {
    const response = await api.get(`/devices/${id}`);
    return response.data;
  },

  // Update device
  async updateDevice(
    id: string,
    data: {
      deviceName?: string;
      syncEnabled?: boolean;
      autoSyncEnabled?: boolean;
      syncSettings?: {
        passwords?: boolean;
        documents?: boolean;
        settings?: boolean;
        notes?: boolean;
      };
      isTrusted?: boolean;
    }
  ): Promise<Device> {
    const response = await api.put(`/devices/${id}`, data);
    return response.data.device;
  },

  // Delete device
  async deleteDevice(id: string, deviceName?: string): Promise<void> {
    await api.delete(`/devices/${id}`);
    // Notification is created by backend
  },

  // Trigger device sync
  async triggerSync(id: string): Promise<{
    syncLog: any;
    message: string;
  }> {
    const response = await api.post(`/devices/${id}/sync`);
    return response.data;
  },

  // Update device status
  async updateDeviceStatus(
    id: string,
    status: 'online' | 'offline' | 'syncing'
  ): Promise<Device> {
    const response = await api.put(`/devices/${id}/status`, { status });
    return response.data.device;
  },

  // Get device statistics
  async getDeviceStats(): Promise<DeviceStats> {
    const response = await api.get('/devices/stats/overview');
    return response.data.stats;
  },

  // Auto-detect current device info
  getCurrentDeviceInfo(): Partial<RegisterDeviceData> {
    const ua = navigator.userAgent;
    let deviceType: 'laptop' | 'mobile' | 'tablet' | 'desktop' = 'desktop';
    
    if (/Mobile|Android|iPhone/i.test(ua)) {
      deviceType = 'mobile';
    } else if (/iPad|Tablet/i.test(ua)) {
      deviceType = 'tablet';
    } else if (/Macintosh|Windows NT|Linux/i.test(ua)) {
      deviceType = /Macintosh/i.test(ua) ? 'laptop' : 'desktop';
    }

    // Detect OS
    let operatingSystem = 'Unknown';
    if (/Windows/i.test(ua)) operatingSystem = 'Windows';
    else if (/Mac OS X/i.test(ua)) operatingSystem = 'macOS';
    else if (/Linux/i.test(ua)) operatingSystem = 'Linux';
    else if (/Android/i.test(ua)) operatingSystem = 'Android';
    else if (/iPhone|iPad/i.test(ua)) operatingSystem = 'iOS';

    // Detect browser
    let browser = 'Unknown';
    if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Edge/i.test(ua)) browser = 'Edge';

    return {
      deviceType,
      operatingSystem,
      browser,
      deviceName: `${browser} on ${operatingSystem}`,
    };
  },

  // Send verification code to email
  async sendVerificationCode(deviceId: string): Promise<{
    success: boolean;
    message: string;
    expiresIn: string;
  }> {
    const response = await api.post(`/devices/${deviceId}/send-verification`);
    return response.data;
  },

  // Verify device with code
  async verifyDevice(deviceId: string, code: string, deviceName?: string): Promise<{
    success: boolean;
    message: string;
    device?: any;
  }> {
    const response = await api.post(`/devices/${deviceId}/verify`, { code });
    // Notification is created by backend
    return response.data;
  },

  // Resend verification code
  async resendVerificationCode(deviceId: string): Promise<{
    success: boolean;
    message: string;
    expiresIn: string;
  }> {
    const response = await api.post(`/devices/${deviceId}/resend-verification`);
    return response.data;
  },
};

export default deviceService;
