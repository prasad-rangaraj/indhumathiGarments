import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'super_admin';
  phone?: string | null;
  address?: string | null;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone: string; address?: string }) => Promise<{ userId: string; email: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (email: string, password: string) => {
        if (get().loading) return; 
        set({ loading: true });

        try {
          const data = await authAPI.login({ email, password });
          // Reset any stale auth error from a previous session so ProtectedRoute doesn't log out immediately
          const { useOrdersStore } = await import('./ordersStore');
          useOrdersStore.setState({ authError: false });
          set({ user: data, token: data.token, isAuthenticated: true, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      
      googleLogin: async (token: string) => {
        if (get().loading) return;
        set({ loading: true });

        try {
          const data = await authAPI.googleLogin(token);
          set({ user: data, token: data.token, isAuthenticated: true, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      register: async (data) => {
        if (get().loading) throw new Error('Request in progress'); 
        set({ loading: true });

        try {
          const result = await authAPI.register(data);
          set({ loading: false });
          return result;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      verifyOtp: async (email: string, otp: string) => {
        const data = await authAPI.verifyOtp({ email, otp });
        set({ user: data.user, token: data.token, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout failed', error);
        }
        set({ user: null, token: null, isAuthenticated: false });
        // Reset orders auth error so there's no stale state on next login
        try {
          const { useOrdersStore } = await import('./ordersStore');
          useOrdersStore.setState({ authError: false, orders: [], lastFetched: 0 });
        } catch {}
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      refreshUser: async () => {
        try {
          const { token } = useAuthStore.getState();
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const baseUrl = import.meta.env.VITE_API_URL || '/api';
          const response = await fetch(`${baseUrl}/auth/me`, { headers, credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            set({ user: data, isAuthenticated: true });
          } else if (response.status === 401) {
            set({ user: null, token: null, isAuthenticated: false });
          }
        } catch {}
      },
    }),
    {
      name: 'auth-storage',
      // SECURITY: Never persist the raw JWT token to localStorage.
      // The backend sets an HttpOnly cookie on login — that is the real auth mechanism.
      // We only persist non-sensitive UI state (who is logged in) for display purposes.
      // The backend re-validates the token from the HttpOnly cookie on every protected request.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);


