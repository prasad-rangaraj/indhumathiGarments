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
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: (userId?: string) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  createOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  getOrdersByStatus: (status: Order['status']) => Order[];
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      loading: false,
      error: null,

      fetchOrders: async (userId?: string) => {
        set({ loading: true, error: null });
        try {
          // If userId not provided, get from auth store (for customer view)
          // If userId is explicitly undefined, fetch all orders (for admin view)
          let targetUserId = userId;
          if (userId === undefined) {
            const { user } = await import('@/stores/authStore').then(m => m.useAuthStore.getState());
            targetUserId = user?.id;
          }
          
          const ordersData = await import('@/lib/api').then(m => m.ordersAPI.getAll(targetUserId));
          
          // Transform backend orders to match frontend Order interface
          const orders: Order[] = ordersData.map((order: any) => ({
            orderId: order.orderId,
            items: order.items.map((item: any) => ({
              id: item.productId || item.product?.id,
              name: item.product?.name || 'Product',
              price: item.price,
              quantity: item.quantity,
              selectedSize: item.size,
              selectedColor: item.color,
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
          }));
          
          set({ orders, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch orders', loading: false });
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
              productId: item.id,
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

      getOrdersByStatus: (status: Order['status']) => {
        return get().orders.filter(o => o.status === status);
      },
    }),
    {
      name: 'orders-storage',
    }
  )
);

