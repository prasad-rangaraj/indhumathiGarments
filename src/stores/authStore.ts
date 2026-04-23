import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
        if (get().loading) return; // Prevent double submit
        set({ loading: true });

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
          }

          const data = await response.json();
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
          const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Google login failed');
          }

          const data = await response.json();
          set({ user: data, token: data.token, isAuthenticated: true, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      register: async (data) => {
        if (get().loading) throw new Error('Request in progress'); // Prevent double submit
        set({ loading: true });

        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
          }

          set({ loading: false });
          return await response.json();
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      verifyOtp: async (email: string, otp: string) => {
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'OTP verification failed');
        }

        const data = await response.json();
        set({ user: data.user, token: data.token, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout failed', error);
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      refreshUser: async () => {
        try {
          const { token } = useAuthStore.getState();
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const response = await fetch('/api/auth/me', { headers, credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            set({ user: data, isAuthenticated: true });
          }
        } catch {}
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);


