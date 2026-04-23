import { create } from 'zustand';

export interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  todayOrders: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  revenueData: Array<{ name: string; revenue: number; orders: number }>;
  categoryData: Array<{ name: string; value: number }>;
  topProducts: Array<{ name: string; sold: number }>;
  recentOrders?: any[];
}

interface AdminState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  lastFetchedStats: number;
  lastFetchedRange: string;
  abortController: AbortController | null;
  fetchDashboardStats: (range?: string) => Promise<void>;
  fetchCustomers: () => Promise<any[]>;
  fetchStaff: () => Promise<any[]>;
  fetchEnquiries: () => Promise<any[]>;
  fetchBanners: () => Promise<any[]>;
  fetchCoupons: () => Promise<any[]>;
  fetchCategories: () => Promise<any[]>;
  categories: any[];
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  loading: false,
  error: null,
  lastFetchedStats: 0,
  lastFetchedRange: '',
  abortController: null,
  categories: [],

  fetchDashboardStats: async (range = 'month') => {
    const { lastFetchedStats, lastFetchedRange, loading, abortController } = get();
    const now = Date.now();
    const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

    // Refetch if range changed or cache expired
    if (!loading && lastFetchedRange === range && (now - lastFetchedStats < CACHE_DURATION)) {
      return;
    }

    if (abortController) abortController.abort();

    const newAbortController = new AbortController();
    set({ loading: true, error: null, abortController: newAbortController });

    try {
      const { adminAPI } = await import('@/lib/api');
      const data = await adminAPI.getDashboardStats(range);

      if (!newAbortController.signal.aborted) {
        set({
          stats: {
            totalRevenue: data.totalRevenue || 0,
            todayRevenue: data.todayRevenue || 0,
            todayOrders: data.todayOrders || 0,
            totalOrders: data.totalOrders || 0,
            totalCustomers: data.totalCustomers || 0,
            totalProducts: data.totalProducts || 0,
            lowStockCount: data.lowStockCount || 0,
            revenueData: data.revenueData || [],
            categoryData: data.categoryData || [],
            topProducts: data.topProducts || [],
            recentOrders: data.recentOrders || [],
          },
          loading: false,
          lastFetchedStats: now,
          lastFetchedRange: range,
          abortController: null,
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      set({ error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats', loading: false, abortController: null });
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

  fetchStaff: async () => {
    set({ loading: true, error: null });
    try {
      const staff = await import('@/lib/api').then(m => m.adminAPI.getStaff());
      set({ loading: false });
      return staff;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch staff', loading: false });
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

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await import('@/lib/api').then(m => m.adminAPI.getCategories());
      set({ categories, loading: false });
      return categories;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch categories', loading: false });
      return [];
    }
  },
}));

