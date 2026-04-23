import { create } from 'zustand';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'active' | 'inactive';
  role: 'customer' | 'admin' | 'super_admin';
}

interface CustomersState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  lastFetched: number;
  abortController: AbortController | null;
  fetchCustomers: (force?: boolean) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  changeUserRole: (id: string, role: 'admin' | 'customer') => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  customers: [],
  loading: false,
  error: null,
  lastFetched: 0,
  abortController: null,

  fetchCustomers: async (force = false) => {
    const { lastFetched, loading, abortController } = get();
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000;

    if (!force && !loading && (now - lastFetched < CACHE_DURATION)) {
      return;
    }

    if (abortController) {
      abortController.abort();
    }

    const newAbortController = new AbortController();
    set({ loading: true, error: null, abortController: newAbortController });

    try {
      const customersData = await import('@/lib/api').then(m => m.adminAPI.getCustomers());
      
      if (!newAbortController.signal.aborted) {
        const customers: Customer[] = customersData.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          totalOrders: c.totalOrders || 0,
          totalSpent: c.totalSpent || 0,
          lastOrderDate: c.lastOrderDate || '',
          status: c.status || 'active',
          role: c.role || 'customer',
        }));
        
        set({ customers, loading: false, lastFetched: now, abortController: null });
      }
    } catch (error) {
       if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      set({ error: error instanceof Error ? error.message : 'Failed to fetch customers', loading: false, abortController: null });
    }
  },

  getCustomerById: (id: string) => {
    return get().customers.find(c => c.id === id);
  },

  updateCustomer: async (id: string, data: Partial<Customer>) => {
    set({ loading: true, error: null });
    try {
      const updated = await import('@/lib/api').then(m => 
        m.adminAPI.updateCustomer(id, { isActive: data.status === 'active' })
      );
      
      const updatedCustomers = get().customers.map(customer =>
        customer.id === id ? { ...customer, ...updated, status: updated.isActive ? 'active' : 'inactive' } : customer
      );
      set({ customers: updatedCustomers, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update customer', loading: false });
    }
  },

  changeUserRole: async (id: string, role: 'admin' | 'customer') => {
    set({ loading: true, error: null });
    try {
      const updated = await import('@/lib/api').then(m => 
        m.adminAPI.changeUserRole(id, { role })
      );
      
      const updatedCustomers = get().customers.map(customer =>
        customer.id === id ? { ...customer, role: updated.role } : customer
      );
      set({ customers: updatedCustomers, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to change user role', loading: false });
      throw error;
    }
  },

  deleteCustomer: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await import('@/lib/api').then(m => m.adminAPI.deleteCustomer(id));
      const filteredCustomers = get().customers.filter(c => c.id !== id);
      set({ customers: filteredCustomers, loading: false });
    } catch (error) {
       set({ error: error instanceof Error ? error.message : 'Failed to delete customer', loading: false });
       throw error;
    }
  },
}));

