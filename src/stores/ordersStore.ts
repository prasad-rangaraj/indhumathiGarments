import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  orderId: string;
  items: any[];
  total: number;
  originalTotal?: number;
  discount?: number;
  couponCode?: string | null;
  customerInfo: {
    name: string;
    address: string;
    city: string;
    pincode: string;
    phone: string;
    email: string;
  };
  paymentMethod: string;
  orderDate: string;
  status: 'Pending' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  delayedDeliveryDate?: string | null;
  delayReason?: string | null;
  cancelReason?: string | null;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  lastFetched: number;
  abortController: AbortController | null;
  fetchOrders: (userId?: string, force?: boolean) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  createOrder: (order: Order) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updateOrderDelay: (orderId: string, data: { delayedDeliveryDate: string | null; delayReason: string | null }) => Promise<void>;
  getOrdersByStatus: (status: Order['status']) => Order[];
}

import { ordersAPI } from '@/lib/api';
export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      loading: false,
      error: null,
      lastFetched: 0,
      abortController: null,

      fetchOrders: async (userId?: string, force = false) => {
        // Evaluate targetUserId to check if we can use cache (if context changed?)
        // For simplicity, we just use global cache time.
        // Ideally we should key cache by userId, but given single-session nature:
        
        const { lastFetched, loading, abortController } = get();
        const now = Date.now();
        const CACHE_DURATION = 30 * 1000; // 30 seconds for more responsive status updates

        if (!force && !loading && (now - lastFetched < CACHE_DURATION)) {
          return;
        }

        if (abortController) {
          abortController.abort();
        }

        const newAbortController = new AbortController();
        set({ loading: true, error: null, abortController: newAbortController });

        try {
          // Logic to determine userId
          let targetUserId = userId;
          if (userId === undefined) {
            const { user } = await import('@/stores/authStore').then(m => m.useAuthStore.getState());
            // Only force customer filter if the user is a customer. Admins fetch all orders.
            if (user && user.role === 'customer') {
              targetUserId = user.id;
            }
          }
          
          // Pass signal if API supports it (assuming we updated API, or we ignore signal for now but handle state)
          // Since we didn't update API signatures to take signal everywhere, we rely on ignoring result.
          // BUT request cancellation at network level requires signal passed to fetch.
          // I can't easily change ALL API methods signatures right now without breaking things.
          // So I will implement "Logical Cancellation" (ignore result).
          
          const ordersData = await import('@/lib/api').then(m => m.ordersAPI.getAll(targetUserId));
          
          if (!newAbortController.signal.aborted) {
            const orders: Order[] = ordersData.map((order: any) => ({
              orderId: order.orderId,
              items: order.items.map((item: any) => ({
                id: item.productId || item.product?.id,
                name: item.product?.name || 'Product',
                price: item.price,
                quantity: item.quantity,
                selectedSize: item.size,
                selectedColor: item.color,
                image: item.product?.image || item.image,
                product: item.product ? {
                  images: item.product.images || [],
                  image: item.product.image,
                } : undefined,
              })),
              total: order.total,
              originalTotal: order.originalTotal,
              discount: order.discount,
              couponCode: order.couponCode,
              customerInfo: {
                name: order.customerName || '',
                address: order.customerAddress || '',
                city: order.customerCity || '',
                pincode: order.customerPincode || '',
                phone: order.customerPhone || '',
                email: order.customerEmail || '',
              },
              paymentMethod: order.paymentMethod,
              orderDate: order.orderDate,
              status: order.status,
              trackingNumber: order.trackingNumber,
              delayedDeliveryDate: order.delayedDeliveryDate,
              delayReason: order.delayReason,
              cancelReason: order.cancelReason,
            }));
            
            set({ orders, loading: false, lastFetched: now, abortController: null });
          }
        } catch (error) {
           if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          set({ error: error instanceof Error ? error.message : 'Failed to fetch orders', loading: false, abortController: null });
        }
      },

      getOrderById: (orderId: string) => {
        return get().orders.find(o => o.orderId === orderId);
      },

      createOrder: async (order: Order) => {
        set({ loading: true, error: null });
        try {
          const { user } = await import('@/stores/authStore').then(m => m.useAuthStore.getState());
          
          const orderData = {
            userId: user?.id || null,
            items: order.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              size: item.selectedSize,
              color: item.selectedColor,
              price: item.price,
            })),
            total: order.total,
            originalTotal: order.originalTotal,
            discount: order.discount,
            couponCode: order.couponCode,
            paymentMethod: order.paymentMethod,
            customerInfo: order.customerInfo,
          };
          
          const newOrder = await import('@/lib/api').then(m => m.ordersAPI.create(orderData));
          
          // Transform and add to state
          const transformedOrder: Order = {
            orderId: newOrder.orderId,
            items: order.items,
            total: newOrder.total,
            originalTotal: newOrder.originalTotal,
            discount: newOrder.discount,
            couponCode: newOrder.couponCode,
            customerInfo: order.customerInfo,
            paymentMethod: newOrder.paymentMethod,
            orderDate: newOrder.orderDate,
            status: newOrder.status,
            trackingNumber: newOrder.trackingNumber,
          };
          
          const updatedOrders = [transformedOrder, ...get().orders];
          set({ orders: updatedOrders, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create order', loading: false });
        }
      },

      updateOrderStatus: async (orderId: string, status: Order['status']) => {
        set({ loading: true, error: null });
        try {
          await import('@/lib/api').then(m => m.ordersAPI.updateStatus(orderId, status));
          
          const updatedOrders = get().orders.map(order =>
            order.orderId === orderId ? { ...order, status } : order
          );
          set({ orders: updatedOrders, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update order', loading: false });
        }
      },

      cancelOrder: async (orderId: string, reason?: string) => {
        set({ loading: true, error: null });
        try {
          await import('@/lib/api').then(m => m.ordersAPI.cancelOrder(orderId, reason));
          
          const updatedOrders = get().orders.map(order =>
            order.orderId === orderId ? { ...order, status: 'Cancelled' as Order['status'], cancelReason: reason } : order
          );
          set({ orders: updatedOrders, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to cancel order', loading: false });
          throw error;
        }
      },

      updateOrderDelay: async (orderId: string, data: { delayedDeliveryDate: string | null; delayReason: string | null }) => {
        set({ loading: true, error: null });
        try {
          await import('@/lib/api').then(m => m.ordersAPI.updateDelay(orderId, data));
          
          const updatedOrders = get().orders.map(order =>
            order.orderId === orderId 
              ? { ...order, delayedDeliveryDate: data.delayedDeliveryDate, delayReason: data.delayReason } 
              : order
          );
          set({ orders: updatedOrders, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update order delay', loading: false });
          throw error;
        }
      },

      getOrdersByStatus: (status: Order['status']) => {
        return get().orders.filter(o => o.status === status);
      },
    }),
    {
      name: 'orders-storage',
    }
  )
);

