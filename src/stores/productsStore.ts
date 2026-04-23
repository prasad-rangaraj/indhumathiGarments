import { create } from 'zustand';
import { Product } from '@/types';
import { productsAPI } from '@/lib/api';

interface ProductsState {
  products: Product[];
  categories: Record<string, string[]>;
  loading: boolean;
  error: string | null;
  lastFetchedProducts: number;
  lastFetchedCategories: number;
  abortController: AbortController | null;
  fetchProducts: (force?: boolean) => Promise<void>;
  fetchCategories: (force?: boolean) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getProductsBySubcategory: (category: string, subcategory: string) => Product[];
  searchProducts: (query: string) => Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: {},
  loading: false,
  error: null,
  lastFetchedProducts: 0,
  lastFetchedCategories: 0,
  abortController: null,

  fetchProducts: async (force = false) => {
    const { lastFetchedProducts, loading, abortController } = get();
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    if (!force && !loading && (now - lastFetchedProducts < CACHE_DURATION)) {
      return; // Return cached data
    }

    // Cancel previous request if it exists
    if (abortController) {
      abortController.abort();
    }

    const newAbortController = new AbortController();
    set({ loading: true, error: null, abortController: newAbortController });

    try {
      const data = await productsAPI.getAll();
      if (!newAbortController.signal.aborted) {
        set({ 
          products: data.products, 
          loading: false, 
          lastFetchedProducts: now,
          abortController: null 
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Ignore abort errors
        return;
      }
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch products', 
        loading: false,
        abortController: null
      });
    }
  },

  fetchCategories: async (force = false) => {
    const { lastFetchedCategories, loading } = get();
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    if (!force && !loading && (now - lastFetchedCategories < CACHE_DURATION)) {
      return; 
    }

    set({ loading: true, error: null });
    try {
      const categories = await productsAPI.getCategories();
      set({ 
        categories, 
        loading: false,
        lastFetchedCategories: now
      });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch categories', loading: false });
    }
  },

  getProductById: (id: string) => {
    return get().products.find(p => p.id === id);
  },

  getProductsByCategory: (category: string) => {
    return get().products.filter(p => p.category === category);
  },

  getProductsBySubcategory: (category: string, subcategory: string) => {
    return get().products.filter(
      p => p.category === category && p.subcategory === subcategory
    );
  },

  searchProducts: (query: string) => {
    const lowerQuery = query.toLowerCase();
    return get().products.filter(
      p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery) ||
        p.subcategory.toLowerCase().includes(lowerQuery)
    );
  },

  addProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await productsAPI.create(productData);
      set(state => ({
        products: [newProduct, ...state.products],
        loading: false,
        lastFetchedCategories: 0 // Invalidate categories cache
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add product', loading: false });
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    set({ loading: true, error: null });
    try {
      const updatedProduct = await productsAPI.update(id, productData);
      set(state => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updatedProduct } : p),
        loading: false,
        lastFetchedCategories: 0 // Invalidate categories cache
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update product', loading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await productsAPI.delete(id);
      set(state => ({
        products: state.products.filter(p => p.id !== id),
        loading: false,
        lastFetchedCategories: 0 // Invalidate categories cache
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete product', loading: false });
      throw error;
    }
  },
}));

