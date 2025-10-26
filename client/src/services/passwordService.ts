import api from './api';

export interface Password {
  _id: string;
  userId: string;
  title: string;
  website?: string;
  username?: string;
  email?: string;
  password: string;
  category?: 'social' | 'email' | 'finance' | 'work' | 'personal' | 'shopping' | 'entertainment' | 'other';
  notes?: string;
  tags: string[];
  isFavorite: boolean;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'lastUsed' | 'website';
  sortOrder?: 'asc' | 'desc';
  favorites?: boolean;
}

const passwordService = {
  // Get all passwords with filters
  async getPasswords(filters: PasswordFilters = {}): Promise<{
    passwords: Password[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
    stats: {
      totalPasswords: number;
      categoryBreakdown: { [key: string]: number };
      recentlyAdded: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.favorites) params.append('favorites', filters.favorites.toString());

    const response = await api.get(`/passwords?${params.toString()}`);
    
    // Backend returns data nested in response.data.data
    const responseData = response.data.data || response.data;
    
    return {
      passwords: responseData.passwords || [],
      pagination: {
        current: responseData.pagination?.currentPage || 1,
        pages: responseData.pagination?.totalPages || 1,
        total: responseData.pagination?.totalItems || 0
      },
      stats: {
        totalPasswords: 0,
        categoryBreakdown: {},
        recentlyAdded: 0
      }
    };
  },

  // Get single password by ID
  async getPassword(id: string): Promise<Password> {
    const response = await api.get(`/passwords/${id}`);
    return response.data.password;
  },

  // Create new password
  async createPassword(data: {
    title: string;
    password: string;
    website?: string;
    username?: string;
    email?: string;
    category?: string;
    notes?: string;
    tags?: string[];
  }): Promise<Password> {
    const response = await api.post('/passwords', data);
    return response.data.password;
  },

  // Update password
  async updatePassword(id: string, data: {
    title?: string;
    password?: string;
    website?: string;
    username?: string;
    email?: string;
    category?: string;
    notes?: string;
    tags?: string[];
    isFavorite?: boolean;
  }): Promise<Password> {
    const response = await api.put(`/passwords/${id}`, data);
    return response.data.password;
  },

  // Delete password
  async deletePassword(id: string): Promise<void> {
    await api.delete(`/passwords/${id}`);
  },

  // Get password statistics
  async getPasswordStats(): Promise<{
    totalPasswords: number;
    categoryBreakdown: { [key: string]: number };
    recentlyAdded: number;
    strongPasswords: number;
    weakPasswords: number;
  }> {
    const response = await api.get('/passwords/stats/overview');
    return response.data.stats;
  },
};

export default passwordService;
