import { create } from 'zustand';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueData: Array<{ name: string; revenue: number; orders: number }>;
  categoryData: Array<{ name: string; value: number }>;
}

interface AdminState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchDashboardStats: () => Promise<void>;
  fetchCustomers: () => Promise<any[]>;
  fetchEnquiries: () => Promise<any[]>;
  fetchBanners: () => Promise<any[]>;
  fetchCoupons: () => Promise<any[]>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  loading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const data = await import('@/lib/api').then(m => m.adminAPI.getDashboard());
      
      const stats: DashboardStats = {
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        totalCustomers: data.totalCustomers || 0,
        totalProducts: data.totalProducts || 0,
        revenueData: data.revenueData || [],
        categoryData: data.categoryData || [],
      };
      
      set({ stats, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats', loading: false });
    }
  },

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const customers = await import('@/lib/api').then(m => m.adminAPI.getCustomers());
      set({ loading: false });
      return customers;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch customers', loading: false });
      return [];
    }
  },

  fetchEnquiries: async () => {
    set({ loading: true, error: null });
    try {
      const enquiries = await import('@/lib/api').then(m => m.adminAPI.getEnquiries());
      set({ loading: false });
      return enquiries;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch enquiries', loading: false });
      return [];
    }
  },

  fetchBanners: async () => {
    set({ loading: true, error: null });
    try {
      const banners = await import('@/lib/api').then(m => m.adminAPI.getBanners());
      set({ loading: false });
      return banners;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch banners', loading: false });
      return [];
    }
  },

  fetchCoupons: async () => {
    set({ loading: true, error: null });
    try {
      const coupons = await import('@/lib/api').then(m => m.adminAPI.getCoupons());
      set({ loading: false });
      return coupons;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch coupons', loading: false });
      return [];
    }
  },
}));

