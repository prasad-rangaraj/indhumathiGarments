import { create } from 'zustand';
import { Product } from '@/contexts/CartContext';
import { productsAPI } from '@/lib/api';

interface ProductsState {
  products: Product[];
  categories: Record<string, string[]>;
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getProductsBySubcategory: (category: string, subcategory: string) => Product[];
  searchProducts: (query: string) => Product[];
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: {},
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await productsAPI.getAll();
      set({ products: data.products, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch products', loading: false });
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await productsAPI.getCategories();
      set({ categories, loading: false });
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
}));

