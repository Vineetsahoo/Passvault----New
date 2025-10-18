import api from './api';

export type AlertType =
  | 'password_expiry'
  | 'weak_password'
  | 'breach'
  | 'login_attempt'
  | 'device_added'
  | 'password_reuse'
  | 'security_scan'
  | 'document_expiry'
  | 'card_expiry'
  | 'pass_expiry'
  | 'sync_failed'
  | 'storage_limit'
  | 'subscription_expiry';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  _id: string;
  userId: string;
  alertType: AlertType;
  severity: Severity;
  title: string;
  message: string;
  relatedTo?: string;
  relatedId?: string;
  isRead: boolean;
  readAt?: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
  expiryDate?: Date;
  metadata?: any;
  notificationSent?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAlertData {
  alertType: AlertType;
  severity?: Severity;
  title: string;
  message: string;
  relatedTo?: string;
  relatedId?: string;
  actionRequired?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  expiryDate?: Date;
  metadata?: any;
}

export interface AlertFilters {
  alertType?: AlertType;
  severity?: Severity;
  isRead?: boolean;
  isResolved?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface AlertStats {
  totalAlerts: number;
  unreadAlerts: number;
  unresolvedAlerts: number;
  criticalAlerts: number;
  severityBreakdown: {
    _id: Severity;
    count: number;
  }[];
  typeBreakdown: {
    _id: AlertType;
    count: number;
  }[];
  recentAlerts: Alert[];
  actionRequired: Alert[];
}

const alertService = {
  // Get all alerts
  async getAlerts(filters: AlertFilters = {}): Promise<{
    alerts: Alert[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters.alertType) params.append('alertType', filters.alertType);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters.isResolved !== undefined) params.append('isResolved', filters.isResolved.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/alerts?${params.toString()}`);
    return response.data;
  },

  // Get unread alerts
  async getUnreadAlerts(): Promise<{
    alerts: Alert[];
    unreadCount: number;
  }> {
    const response = await api.get('/alerts/unread');
    return response.data;
  },

  // Get critical alerts
  async getCriticalAlerts(): Promise<{
    alerts: Alert[];
    count: number;
  }> {
    const response = await api.get('/alerts/critical');
    return response.data;
  },

  // Create alert
  async createAlert(data: CreateAlertData): Promise<Alert> {
    const response = await api.post('/alerts', data);
    return response.data.alert;
  },

  // Mark alert as read
  async markAsRead(id: string): Promise<Alert> {
    const response = await api.put(`/alerts/${id}/read`);
    return response.data.alert;
  },

  // Resolve alert
  async resolveAlert(id: string): Promise<Alert> {
    const response = await api.put(`/alerts/${id}/resolve`);
    return response.data.alert;
  },

  // Delete alert
  async deleteAlert(id: string): Promise<void> {
    await api.delete(`/alerts/${id}`);
  },

  // Mark all alerts as read
  async markAllRead(): Promise<{
    message: string;
    updated: number;
  }> {
    const response = await api.put('/alerts/mark-all-read');
    return response.data;
  },

  // Get alert statistics
  async getAlertStats(): Promise<AlertStats> {
    const response = await api.get('/alerts/stats/overview');
    return response.data.stats;
  },

  // Check for expirations and create alerts
  async checkExpirations(): Promise<{
    alertsCreated: number;
    expiringPasswords: number;
    expiringDocuments: number;
  }> {
    const response = await api.post('/alerts/check-expirations');
    return response.data;
  },

  // Helper: Get severity color
  getSeverityColor(severity: Severity): string {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  },

  // Helper: Get alert type label
  getAlertTypeLabel(type: AlertType): string {
    const labels: Record<AlertType, string> = {
      password_expiry: 'Password Expiring',
      weak_password: 'Weak Password',
      breach: 'Security Breach',
      login_attempt: 'Login Attempt',
      device_added: 'New Device',
      password_reuse: 'Password Reuse',
      security_scan: 'Security Scan',
      document_expiry: 'Document Expiring',
      card_expiry: 'Card Expiring',
      pass_expiry: 'Pass Expiring',
      sync_failed: 'Sync Failed',
      storage_limit: 'Storage Limit',
      subscription_expiry: 'Subscription Expiring',
    };
    return labels[type] || type;
  },

  // Helper: Get alert type icon
  getAlertTypeIcon(type: AlertType): string {
    const icons: Record<AlertType, string> = {
      password_expiry: '⏰',
      weak_password: '⚠️',
      breach: '🚨',
      login_attempt: '🔐',
      device_added: '📱',
      password_reuse: '🔄',
      security_scan: '🔍',
      document_expiry: '📄',
      card_expiry: '💳',
      pass_expiry: '🎫',
      sync_failed: '❌',
      storage_limit: '💾',
      subscription_expiry: '💳',
    };
    return icons[type] || '🔔';
  },
};

export default alertService;
