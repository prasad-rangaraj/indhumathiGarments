import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { cartAPI } from '@/lib/api';
import { resolveItemImage } from '@/lib/utils';
import { useAuthStore } from './authStore';

export interface CartItem {
  id: string; // Composite ID: `${productId}-${size}-${color}`
  productId: string; // Raw database ID
  name: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
  image?: string;
  images?: string[];
  category?: string;
  cartItemId?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  error: string | null;
  lastFetchedCart: number;
  abortController: AbortController | null;
  fetchCart: (force?: boolean) => Promise<void>;
  addItem: (product: Product, size: string, quantity?: number, selectedColor?: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
}

const getUserId = (): string => {
  const { user } = useAuthStore.getState();
  return user?.id || 'guest';
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      loading: false,
      error: null,
      lastFetchedCart: 0,
      abortController: null,

      fetchCart: async (force = false) => {
        const userId = getUserId();
        if (userId === 'guest') {
          // For guests, keep local storage items
          const localItems = get().items;
          const total = localItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
          set({ total });
          return;
        }
        
        const { lastFetchedCart, loading, abortController } = get();
        const now = Date.now();
        const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes shorter cache for cart

        if (!force && !loading && (now - lastFetchedCart < CACHE_DURATION)) {
          return; 
        }

        if (abortController) {
          abortController.abort();
        }

        const newAbortController = new AbortController();
        set({ loading: true, error: null, abortController: newAbortController });

        try {
          const cartItems = await cartAPI.get();
          
          if (!newAbortController.signal.aborted) {
            const { useProductsStore } = await import('./productsStore');
            const items: CartItem[] = cartItems.map((item: any) => {
              const storeProduct = useProductsStore.getState().products.find((p: any) => p.id === item.product.id);
              const mergedProduct = storeProduct || item.product;
              const mappedItem = {
                ...mergedProduct,
                productId: item.product.id,
                quantity: item.quantity,
                selectedSize: item.size,
                selectedColor: item.color,
                id: `${item.product.id}-${item.size}${item.color ? `-${item.color}` : ''}`,
                cartItemId: item.id,
              };
              
              // We need to resolve the image before saving to local store so it doesn't fall back to generic
              mappedItem.image = resolveItemImage(mappedItem) || mappedItem.image;
              return mappedItem;
            });
            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            set({ items, total, loading: false, lastFetchedCart: now, abortController: null });
          }
        } catch (error) {
           if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          set({ error: error instanceof Error ? error.message : 'Failed to fetch cart', loading: false, abortController: null });
        }
      },

      addItem: async (product: Product, size: string, quantity: number = 1, selectedColor?: string) => {
        const userId = getUserId();
        const compositeId = `${product.id}-${size}${selectedColor ? `-${selectedColor}` : ''}`;
        const previousItems = get().items;
        const existingItem = previousItems.find(item => item.id === compositeId);

        // Resolve the color-specific primary image
        let colorImage: string | undefined;
        if (selectedColor && product.colors) {
          const colorObj = product.colors.find(c => c.name === selectedColor);
          if (colorObj) {
            colorImage = colorObj.primaryImage || (colorObj.images && colorObj.images.length > 1 ? colorObj.images[1] : colorObj.images?.[0]);
          }
        }
        // Fall back to product primary image
        const resolvedImage = colorImage || product.image;

        let updatedItems: CartItem[];
        
        if (existingItem) {
          updatedItems = previousItems.map(item =>
            item.id === compositeId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedItems = [
            ...previousItems,
            {
              ...product,
              productId: product.id,
              id: compositeId,
              quantity: quantity,
              selectedSize: size,
              selectedColor: selectedColor,
              image: resolvedImage,
            }
          ];
        }

        // Optimistic Update
        const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        set({ items: updatedItems, total, error: null });

        try {
          if (userId !== 'guest') {
            if (existingItem && existingItem.cartItemId) {
              await cartAPI.update(existingItem.cartItemId, existingItem.quantity + quantity);
            } else {
              const result = await cartAPI.add({
                productId: product.id,
                quantity,
                size,
                color: selectedColor,
              });
              // Update the store with the newly assigned database cartItemId
              const mappedItems = get().items.map(i => 
                i.id === compositeId && !i.cartItemId ? { ...i, cartItemId: result.id } : i
              );
              set({ items: mappedItems });
            }
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add item to backend' });
          console.error("Failed to add item to backend", error);
          // Assuming failure, we could revert if strict consistency is needed, but typically logging is fine
        }
      },

      removeItem: async (id: string) => {
        const userId = getUserId();
        const previousItems = get().items;
        
        // Optimistic Update
        const updatedItems = previousItems.filter(item => item.id !== id);
        const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        set({ items: updatedItems, total, error: null });

        try {
          if (userId !== 'guest') {
            const targetItem = previousItems.find(i => i.id === id);
            if (targetItem?.cartItemId) {
              await cartAPI.remove(targetItem.cartItemId);
            }
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to remove item' });
          console.error('Failed to remove item from backend', error);
        }
      },

      updateQuantity: async (id: string, quantity: number) => {
        if (quantity <= 0) {
          return get().removeItem(id);
        }

        const userId = getUserId();
        const previousItems = get().items;

        // Optimistic Update
        const updatedItems = previousItems
          .map(item =>
            item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
          )
          .filter(item => item.quantity > 0);
        
        const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        set({ items: updatedItems, total, error: null });

        try {
          if (userId !== 'guest') {
            const targetItem = previousItems.find(i => i.id === id);
            if (targetItem?.cartItemId) {
              await cartAPI.update(targetItem.cartItemId, quantity);
            }
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update quantity' });
          console.error("Failed to update quantity", error);
        }
      },

      clearCart: async () => {
        const userId = getUserId();
        set({ loading: true, error: null });
        
        try {
          if (userId !== 'guest') {
            await cartAPI.clear();
          }
          set({ items: [], total: 0, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to clear cart', loading: false });
        }
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage-v3',
    }
  )
);

