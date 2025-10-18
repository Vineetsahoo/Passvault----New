import api from './api';

export type QRCodeType = 'wifi' | 'password' | 'url' | 'text' | 'contact' | 'email' | 'phone' | 'payment';

export interface QRCode {
  _id: string;
  userId: string;
  qrType: QRCodeType;
  title: string;
  data: any;
  qrCodeImage: string; // Base64
  isEncrypted: boolean;
  category?: string;
  tags: string[];
  description?: string;
  scanCount: number;
  lastScannedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  maxScans?: number;
  scanHistory: {
    scannedAt: Date;
    deviceInfo?: string;
    ipAddress?: string;
    location?: {
      city?: string;
      country?: string;
    };
  }[];
  shareSettings: {
    isPublic: boolean;
    sharedWith: string[];
    requirePassword: boolean;
  };
  color?: string;
  backgroundColor?: string;
  size?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQRCodeData {
  qrType: QRCodeType;
  title: string;
  data: any;
  isEncrypted?: boolean;
  category?: string;
  tags?: string[];
  description?: string;
  expiresIn?: number; // days
  maxScans?: number;
  color?: string;
  backgroundColor?: string;
  size?: number;
}

export interface QRCodeFilters {
  qrType?: QRCodeType;
  category?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface QRCodeStats {
  totalQRCodes: number;
  totalScans: number;
  activeQRCodes: number;
  typeBreakdown: {
    _id: QRCodeType;
    count: number;
    totalScans: number;
  }[];
  recentScans: QRCode[];
  popularQRCodes: QRCode[];
}

export interface ScanQRCodeData {
  deviceInfo?: string;
  location?: {
    city?: string;
    country?: string;
  };
}

export interface QRScanResult {
  success: boolean;
  qrCode: {
    type: QRCodeType;
    title: string;
    content: any;
    scanCount: number;
  };
}

const qrcodeService = {
  // Create QR code
  async createQRCode(data: CreateQRCodeData): Promise<QRCode> {
    const response = await api.post('/qrcodes', data);
    return response.data.qrCode;
  },

  // Get QR codes with filters
  async getQRCodes(filters: QRCodeFilters = {}): Promise<{
    qrcodes: QRCode[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters.qrType) params.append('qrType', filters.qrType);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await api.get(`/qrcodes?${params.toString()}`);
    
    // Backend returns 'qrCodes' but we normalize to 'qrcodes'
    return {
      qrcodes: response.data.qrCodes || [],
      pagination: response.data.pagination || {
        current: 1,
        pages: 1,
        total: 0
      }
    };
  },

  // Get single QR code
  async getQRCode(id: string): Promise<QRCode> {
    const response = await api.get(`/qrcodes/${id}`);
    return response.data.qrCode;
  },

  // Update QR code
  async updateQRCode(
    id: string,
    data: {
      title?: string;
      category?: string;
      tags?: string[];
      description?: string;
      isActive?: boolean;
    }
  ): Promise<QRCode> {
    const response = await api.put(`/qrcodes/${id}`, data);
    return response.data.qrCode;
  },

  // Delete QR code
  async deleteQRCode(id: string): Promise<void> {
    await api.delete(`/qrcodes/${id}`);
  },

  // Scan QR code (public endpoint)
  async scanQRCode(id: string, scanData?: ScanQRCodeData): Promise<QRScanResult> {
    const response = await api.post(`/qrcodes/${id}/scan`, scanData || {});
    return response.data;
  },

  // Get QR code image (public endpoint)
  async getQRCodeImage(id: string): Promise<string> {
    const response = await api.get(`/qrcodes/${id}/image`);
    return response.data.qrCodeImage;
  },

  // Decode QR code data
  async decodeQRCode(qrData: string): Promise<{
    type: QRCodeType;
    data: any;
  }> {
    const response = await api.post('/qrcodes/scan/decode', { qrData });
    return response.data;
  },

  // Get QR code statistics
  async getQRCodeStats(): Promise<QRCodeStats> {
    const response = await api.get('/qrcodes/stats/overview');
    return response.data.stats;
  },

  // Helper: Format WiFi QR data
  formatWiFiData(ssid: string, password: string, security: 'WPA' | 'WEP' | 'nopass' = 'WPA') {
    return {
      ssid,
      password,
      security,
      hidden: false,
    };
  },

  // Helper: Format Contact QR data (vCard)
  formatContactData(contact: {
    name: string;
    phone?: string;
    email?: string;
    organization?: string;
    address?: string;
    website?: string;
  }) {
    return contact;
  },

  // Helper: Format Payment QR data
  formatPaymentData(payment: {
    recipient: string;
    amount?: number;
    currency?: string;
    note?: string;
  }) {
    return payment;
  },
};

export default qrcodeService;
