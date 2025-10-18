import api from './api';

export type SyncType = 'manual' | 'auto' | 'scheduled' | 'forced';
export type SyncStatus = 'initiated' | 'in_progress' | 'completed' | 'failed' | 'partial';

export interface SyncLog {
  _id: string;
  userId: string;
  deviceId: string;
  syncType: SyncType;
  syncStatus: SyncStatus;
  dataTypes: string[];
  itemsSynced: {
    passwords: number;
    documents: number;
    settings: number;
    notes: number;
    qrcodes: number;
  };
  totalItems: number;
  dataSynced: number; // bytes
  duration: number; // milliseconds
  startedAt: Date;
  completedAt?: Date;
  error?: {
    message: string;
    code: string;
    stack?: string;
  };
  conflicts: {
    itemType: string;
    itemId: string;
    conflictType: string;
    resolution?: string;
    resolvedAt?: Date;
    resolvedBy?: string;
  }[];
  metadata?: any;
}

export interface InitiateSyncData {
  deviceId: string;
  syncType?: SyncType;
  dataTypes?: string[];
  metadata?: any;
}

export interface SyncFilters {
  deviceId?: string;
  syncType?: SyncType;
  syncStatus?: SyncStatus;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface SyncStats {
  totalSyncs: number;
  completedSyncs: number;
  failedSyncs: number;
  totalDataSynced: number;
  totalItemsSynced: number;
  avgDuration: number;
  totalConflicts: number;
  statusBreakdown: {
    _id: SyncStatus;
    count: number;
  }[];
  typeBreakdown: {
    _id: SyncType;
    count: number;
  }[];
  recentSyncs: SyncLog[];
  dataTypeStats: {
    totalPasswords: number;
    totalDocuments: number;
    totalSettings: number;
    totalNotes: number;
    totalQRCodes: number;
  };
  performanceMetrics: {
    avgSyncSpeed: number; // bytes per second
    maxDuration: number;
    minDuration: number;
  };
}

export interface SyncSettings {
  syncEnabled: boolean;
  autoSyncEnabled: boolean;
  syncSettings: {
    passwords: boolean;
    documents: boolean;
    settings: boolean;
    notes: boolean;
  };
}

const syncService = {
  // Initiate sync
  async initiateSync(data: InitiateSyncData): Promise<{
    syncLog: {
      id: string;
      syncType: SyncType;
      syncStatus: SyncStatus;
      dataTypes: string[];
      startedAt: Date;
    };
    message: string;
  }> {
    const response = await api.post('/sync/initiate', data);
    return response.data;
  },

  // Get sync status
  async getSyncStatus(syncLogId: string): Promise<SyncLog> {
    const response = await api.get(`/sync/status/${syncLogId}`);
    return response.data.syncLog;
  },

  // Get sync history
  async getSyncHistory(filters: SyncFilters = {}): Promise<{
    syncLogs: SyncLog[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters.deviceId) params.append('deviceId', filters.deviceId);
    if (filters.syncType) params.append('syncType', filters.syncType);
    if (filters.syncStatus) params.append('syncStatus', filters.syncStatus);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/sync/history?${params.toString()}`);
    return response.data;
  },

  // Get recent syncs
  async getRecentSyncs(limit: number = 10): Promise<SyncLog[]> {
    const response = await api.get(`/sync/recent?limit=${limit}`);
    return response.data.syncLogs;
  },

  // Get unresolved conflicts
  async getConflicts(): Promise<{
    conflicts: {
      syncLogId: string;
      deviceName: string;
      syncedAt: Date;
      conflicts: any[];
    }[];
    totalConflicts: number;
  }> {
    const response = await api.get('/sync/conflicts');
    return response.data;
  },

  // Resolve conflict
  async resolveConflict(
    syncLogId: string,
    conflictIndex: number,
    resolution: string
  ): Promise<{
    conflict: any;
    message: string;
  }> {
    const response = await api.put(`/sync/resolve-conflict/${syncLogId}`, {
      conflictIndex,
      resolution,
    });
    return response.data;
  },

  // Get sync statistics
  async getSyncStats(): Promise<SyncStats> {
    const response = await api.get('/sync/stats/overview');
    return response.data.stats;
  },

  // Cancel sync
  async cancelSync(syncLogId: string): Promise<{
    message: string;
  }> {
    const response = await api.post(`/sync/cancel/${syncLogId}`);
    return response.data;
  },

  // Get sync settings for all devices
  async getSyncSettings(): Promise<{
    devices: {
      _id: string;
      deviceName: string;
      deviceType: string;
      syncEnabled: boolean;
      autoSyncEnabled: boolean;
      syncSettings: {
        passwords: boolean;
        documents: boolean;
        settings: boolean;
        notes: boolean;
      };
    }[];
  }> {
    const response = await api.get('/sync/settings');
    return response.data;
  },

  // Update sync settings for a device
  async updateSyncSettings(
    deviceId: string,
    settings: {
      syncEnabled?: boolean;
      autoSyncEnabled?: boolean;
      syncSettings?: {
        passwords?: boolean;
        documents?: boolean;
        settings?: boolean;
        notes?: boolean;
      };
    }
  ): Promise<{
    device: any;
    message: string;
  }> {
    const response = await api.put(`/sync/settings/${deviceId}`, settings);
    return response.data;
  },

  // Helper: Format sync duration
  formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  },

  // Helper: Format data size
  formatDataSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  },

  // Helper: Get sync status color
  getSyncStatusColor(status: SyncStatus): string {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
      case 'initiated':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'partial':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  },

  // Helper: Get sync status label
  getSyncStatusLabel(status: SyncStatus): string {
    const labels: Record<SyncStatus, string> = {
      initiated: 'Initiated',
      in_progress: 'In Progress',
      completed: 'Completed',
      failed: 'Failed',
      partial: 'Partial',
    };
    return labels[status] || status;
  },

  // Helper: Get sync type label
  getSyncTypeLabel(type: SyncType): string {
    const labels: Record<SyncType, string> = {
      manual: 'Manual',
      auto: 'Automatic',
      scheduled: 'Scheduled',
      forced: 'Forced',
    };
    return labels[type] || type;
  },
};

export default syncService;
