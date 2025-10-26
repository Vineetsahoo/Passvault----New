import axios from 'axios';
import api from './api';

const API_URL = 'http://localhost:5000/api';

export interface NotificationData {
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'alert' | 'security' | 'sync' | 'info';
  category?: 'password' | 'security' | 'sync' | 'system' | 'billing' | 'profile' | 'document' | 'alerts';
  priority?: 'high' | 'medium' | 'low';
  action?: {
    type: 'internal' | 'external';
    label: string;
    link?: string;
  };
  metadata?: Record<string, any>;
}

class NotificationService {
  /**
   * Create a new notification for the current user
   */
  async createNotification(notificationData: NotificationData): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('No access token found, skipping notification creation');
        return null;
      }

      const response = await axios.post(
        `${API_URL}/user/notifications`,
        notificationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get all notifications
   */
  async getNotifications(params?: {
    filter?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get(`${API_URL}/user/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.put(
        `${API_URL}/user/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.put(
        `${API_URL}/user/notifications/mark-all-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.delete(
        `${API_URL}/user/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.delete(`${API_URL}/user/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }

  // ============ Helper Methods for Common Notifications ============

  /**
   * Device-related notifications
   */
  async notifyDeviceRegistered(deviceName: string, deviceType: string): Promise<void> {
    await this.createNotification({
      title: 'New Device Registered',
      message: `"${deviceName}" has been added to your account.`,
      type: 'success',
      category: 'security',
      priority: 'medium',
      action: {
        type: 'internal',
        label: 'View Devices',
        link: '/features/multi-device',
      },
      metadata: {
        resourceType: 'device',
        deviceName,
        deviceType,
      },
    });
  }

  async notifyDeviceVerified(deviceName: string): Promise<void> {
    await this.createNotification({
      title: 'Device Verified',
      message: `"${deviceName}" has been successfully verified and is now trusted.`,
      type: 'success',
      category: 'security',
      priority: 'medium',
      action: {
        type: 'internal',
        label: 'View Devices',
        link: '/features/multi-device',
      },
      metadata: {
        resourceType: 'device',
        deviceName,
      },
    });
  }

  async notifyDeviceRemoved(deviceName: string): Promise<void> {
    await this.createNotification({
      title: 'Device Removed',
      message: `"${deviceName}" has been removed from your account.`,
      type: 'alert',
      category: 'security',
      priority: 'high',
      action: {
        type: 'internal',
        label: 'View Devices',
        link: '/features/multi-device',
      },
      metadata: {
        resourceType: 'device',
        deviceName,
      },
    });
  }

  /**
   * Sync-related notifications
   */
  async notifySyncCompleted(itemCount: number, dataSize: string): Promise<void> {
    await this.createNotification({
      title: 'Sync Completed',
      message: `Successfully synced ${itemCount} items (${dataSize}) across your devices.`,
      type: 'success',
      category: 'sync',
      priority: 'low',
      action: {
        type: 'internal',
        label: 'View Sync History',
        link: '/features/sync',
      },
      metadata: {
        resourceType: 'sync',
        itemCount,
        dataSize,
      },
    });
  }

  async notifySyncFailed(error: string): Promise<void> {
    await this.createNotification({
      title: 'Sync Failed',
      message: `Unable to sync your data: ${error}`,
      type: 'alert',
      category: 'sync',
      priority: 'high',
      action: {
        type: 'internal',
        label: 'Retry Sync',
        link: '/features/sync',
      },
      metadata: {
        resourceType: 'sync',
        error,
      },
    });
  }

  /**
   * Backup-related notifications
   */
  async notifyBackupCompleted(backupSize: string): Promise<void> {
    await this.createNotification({
      title: 'Backup Completed',
      message: `Your data has been backed up successfully (${backupSize}).`,
      type: 'success',
      category: 'system',
      priority: 'low',
      action: {
        type: 'internal',
        label: 'View Backups',
        link: '/dashboard/backup',
      },
      metadata: {
        resourceType: 'backup',
        backupSize,
      },
    });
  }

  async notifyBackupFailed(error: string): Promise<void> {
    await this.createNotification({
      title: 'Backup Failed',
      message: `Backup process failed: ${error}`,
      type: 'alert',
      category: 'system',
      priority: 'high',
      action: {
        type: 'internal',
        label: 'View Backup Settings',
        link: '/dashboard/backup',
      },
      metadata: {
        resourceType: 'backup',
        error,
      },
    });
  }

  async notifyRestoreCompleted(): Promise<void> {
    await this.createNotification({
      title: 'Restore Completed',
      message: 'Your data has been successfully restored from backup.',
      type: 'success',
      category: 'system',
      priority: 'medium',
      action: {
        type: 'internal',
        label: 'View Dashboard',
        link: '/dashboard',
      },
      metadata: {
        resourceType: 'backup',
        action: 'restore',
      },
    });
  }

  async notifyRestoreFailed(error: string): Promise<void> {
    await this.createNotification({
      title: 'Restore Failed',
      message: `Failed to restore data: ${error}`,
      type: 'alert',
      category: 'system',
      priority: 'high',
      action: {
        type: 'internal',
        label: 'Contact Support',
        link: '/dashboard/backup',
      },
      metadata: {
        resourceType: 'backup',
        action: 'restore',
        error,
      },
    });
  }

  /**
   * Storage-related notifications
   */
  async notifyStorageAlert(usedPercentage: number): Promise<void> {
    await this.createNotification({
      title: 'Storage Alert',
      message: `Your storage is ${usedPercentage}% full. Consider cleaning up old data.`,
      type: 'warning',
      category: 'system',
      priority: usedPercentage >= 90 ? 'high' : 'medium',
      action: {
        type: 'internal',
        label: 'View Storage',
        link: '/features/secure-storage',
      },
      metadata: {
        resourceType: 'storage',
        usedPercentage,
      },
    });
  }

  async notifySecurityScanCompleted(status: 'secure' | 'warning' | 'critical'): Promise<void> {
    const typeMap = {
      secure: 'success' as const,
      warning: 'warning' as const,
      critical: 'alert' as const,
    };

    const priorityMap = {
      secure: 'low' as const,
      warning: 'medium' as const,
      critical: 'high' as const,
    };

    await this.createNotification({
      title: 'Security Scan Completed',
      message: `Security scan finished with status: ${status.toUpperCase()}`,
      type: typeMap[status],
      category: 'security',
      priority: priorityMap[status],
      action: {
        type: 'internal',
        label: 'View Security Report',
        link: '/features/secure-storage',
      },
      metadata: {
        resourceType: 'security',
        scanStatus: status,
      },
    });
  }
}

export default new NotificationService();
