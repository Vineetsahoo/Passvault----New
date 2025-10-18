import api from './api';

export interface Document {
  _id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  category: 'document' | 'image' | 'video' | 'audio' | 'other';
  tags: string[];
  description?: string;
  sharedWith: string[];
  isArchived: boolean;
  isFavorite: boolean;
  expiresAt?: Date;
  downloadCount: number;
  lastAccessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadDocumentData {
  file: File;
  category?: string;
  tags?: string[];
  description?: string;
  expiresIn?: number; // days
}

export interface DocumentFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface DocumentStats {
  totalSize: number;
  totalDocuments: number;
  totalDownloads: number;
  categoryStats: {
    _id: string;
    count: number;
    totalSize: number;
  }[];
  recentUploads: Document[];
  expiringDocuments: Document[];
}

const documentService = {
  // Upload document
  async uploadDocument(data: UploadDocumentData): Promise<Document> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.category) formData.append('category', data.category);
    if (data.description) formData.append('description', data.description);
    if (data.expiresIn) formData.append('expiresIn', data.expiresIn.toString());
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.document;
  },

  // Get documents with filters
  async getDocuments(filters: DocumentFilters = {}): Promise<{
    documents: Document[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
    stats: {
      totalSize: number;
      totalCount: number;
      categories: { [key: string]: number };
    };
  }> {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await api.get(`/documents?${params.toString()}`);
    return response.data;
  },

  // Get single document
  async getDocument(id: string): Promise<Document> {
    const response = await api.get(`/documents/${id}`);
    return response.data.document;
  },

  // Download document
  async downloadDocument(id: string): Promise<Blob> {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete document
  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  // Update document
  async updateDocument(
    id: string,
    data: {
      category?: string;
      tags?: string[];
      description?: string;
      isFavorite?: boolean;
    }
  ): Promise<Document> {
    const response = await api.put(`/documents/${id}`, data);
    return response.data.document;
  },

  // Archive document
  async archiveDocument(id: string, isArchived: boolean): Promise<Document> {
    const response = await api.put(`/documents/${id}/archive`, { isArchived });
    return response.data.document;
  },

  // Get document statistics
  async getDocumentStats(): Promise<DocumentStats> {
    const response = await api.get('/documents/stats/overview');
    return response.data.stats;
  },
};

export default documentService;
