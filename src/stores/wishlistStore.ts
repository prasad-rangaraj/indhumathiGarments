import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { wishlistAPI } from '@/lib/api';
import { useAuthStore } from './authStore';

interface WishlistState {
  items: Product[];
  loading: boolean;
  error: string | null;
  lastFetched: number;
  abortController: AbortController | null;
  fetchWishlist: (force?: boolean) => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getItemCount: () => number;
}

const getUserId = (): string => {
  const { user } = useAuthStore.getState();
  return user?.id || 'guest';
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      lastFetched: 0,
      abortController: null,

      fetchWishlist: async (force = false) => {
        const userId = getUserId();
        if (userId === 'guest') return;
        
        const { lastFetched, loading, abortController } = get();
        const now = Date.now();
        const CACHE_DURATION = 2 * 60 * 1000; // 2 mins

        if (!force && !loading && (now - lastFetched < CACHE_DURATION)) {
          return;
        }

        if (abortController) {
          abortController.abort();
        }

        const newAbortController = new AbortController();
        set({ loading: true, error: null, abortController: newAbortController });

        try {
          const wishlistItems = await wishlistAPI.get();
          
          if (!newAbortController.signal.aborted) {
            const items: Product[] = wishlistItems.map((item: any) => ({
              ...item.product,
              id: item.product.id,
            }));
            set({ items, loading: false, lastFetched: now, abortController: null });
          }
        } catch (error) {
           if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          set({ error: error instanceof Error ? error.message : 'Failed to fetch wishlist', loading: false, abortController: null });
        }
      },

      addToWishlist: async (product: Product) => {
        const userId = getUserId();
        set({ loading: true, error: null });
        
        try {
          if (userId !== 'guest') {
            await wishlistAPI.add({ productId: product.id });
          }
          
          const exists = get().items.find(item => item.id === product.id);
          if (!exists) {
            set({ items: [...get().items, product], loading: false });
          } else {
            set({ loading: false });
          }
        } catch (error: any) {
          // Handle duplicate error gracefully
          if (error.message?.includes('already in wishlist')) {
            set({ loading: false });
            return;
          }
          set({ error: error instanceof Error ? error.message : 'Failed to add to wishlist', loading: false });
        }
      },

      removeFromWishlist: async (productId: string) => {
        const userId = getUserId();
        set({ loading: true, error: null });
        
        try {
          if (userId !== 'guest') {
            await wishlistAPI.remove(productId);
          }
          set({ items: get().items.filter(item => item.id !== productId), loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to remove from wishlist', loading: false });
        }
      },

      clearWishlist: async () => {
        set({ loading: true, error: null });
        try {
          // Remove all items one by one sequentially (no batching)
          const userId = getUserId();
          if (userId !== 'guest') {
            const items = get().items;
            for (const item of items) {
              await wishlistAPI.remove(item.id);
            }
          }
          set({ items: [], loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to clear wishlist', loading: false });
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some(item => item.id === productId);
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);

