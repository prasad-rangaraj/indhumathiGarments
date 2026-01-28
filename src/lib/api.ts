import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = '/api';

// Helper function to get auth headers (Optional now with Cookies)
const getAuthHeaders = () => {
  const { token } = useAuthStore.getState();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important for cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: (data: any) => apiRequest<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => apiRequest<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data: { email: string; otp: string }) => 
    apiRequest<any>('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  logout: () => apiRequest<{ message: string }>('/auth/logout', { method: 'POST' }),
  resetPassword: (token: string, password: string) =>
    apiRequest<{ message: string; token: string }>('/auth/reset-password/' + token, { method: 'POST', body: JSON.stringify({ password }) }),
};

// User API
export const userAPI = {
  getProfile: (id: string) => apiRequest<any>(`/users/${id}`),
  updateProfile: (data: any) => 
    apiRequest<any>('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
};

// Products API
export const productsAPI = {
  getAll: (params?: { category?: string; subcategory?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.subcategory) queryParams.append('subcategory', params.subcategory);
    if (params?.search) queryParams.append('search', params.search);
    
    return apiRequest<{ products: any[]; total: number }>(
      `/products?${queryParams.toString()}`
    );
  },
  getById: (id: string) => apiRequest<any>(`/products/${id}`),
  getCategories: () => apiRequest<Record<string, string[]>>('/products/categories/list'),
  create: (data: any) => apiRequest<any>('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiRequest<any>(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest<{ message: string }>(`/admin/products/${id}`, { method: 'DELETE' }),
};

// Cart API
export const cartAPI = {
  get: () => apiRequest<any[]>('/cart'),
  add: (data: { productId: string; quantity: number; size: string; color?: string }) =>
    apiRequest<any>('/cart', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, quantity: number) =>
    apiRequest<any>(`/cart/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  remove: (id: string) => apiRequest<{ message: string }>(`/cart/${id}`, { method: 'DELETE' }),
  clear: () => apiRequest<{ message: string }>(`/cart`, { method: 'DELETE' }),
};

// Orders API
export const ordersAPI = {
  getAll: (userId?: string, status?: string) => {
    const queryParams = new URLSearchParams();
    if (userId) queryParams.append('userId', userId);
    if (status) queryParams.append('status', status);
    return apiRequest<any[]>(`/orders?${queryParams.toString()}`);
  },
  getById: (orderId: string) => apiRequest<any>(`/orders/${orderId}`),
  create: (order: any) => apiRequest<any>('/orders', { method: 'POST', body: JSON.stringify(order) }),
  updateStatus: (orderId: string, status: string) =>
    apiRequest<any>(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// Wishlist API
export const wishlistAPI = {
  get: () => apiRequest<any[]>('/wishlist'),
  add: (data: { productId: string }) =>
    apiRequest<any>('/wishlist', { method: 'POST', body: JSON.stringify(data) }),
  remove: (productId: string) =>
    apiRequest<{ message: string }>(`/wishlist/${productId}`, { method: 'DELETE' }),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId: string) => apiRequest<any[]>(`/reviews/product/${productId}`),
  create: (review: any) => apiRequest<any>('/reviews', { method: 'POST', body: JSON.stringify(review) }),
};

// Admin API
export const adminAPI = {
  getDashboard: () => apiRequest<any>('/admin/dashboard'),
  getCategories: () => apiRequest<any[]>('/admin/categories'),
  createCategory: (data: any) => apiRequest<any>('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => apiRequest<{ message: string }>(`/admin/categories/${id}`, { method: 'DELETE' }),
  getCustomers: () => apiRequest<any[]>('/admin/customers'),
  updateCustomer: (id: string, data: { isActive: boolean }) =>
    apiRequest<any>(`/admin/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getEnquiries: () => apiRequest<any[]>('/admin/enquiries'),
  updateEnquiry: (id: string, data: { status: string }) =>
    apiRequest<any>(`/admin/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getBanners: () => apiRequest<any[]>('/admin/banners'),
  createBanner: (data: any) =>
    apiRequest<any>('/admin/banners', { method: 'POST', body: JSON.stringify(data) }),
  updateBanner: (id: string, data: any) =>
    apiRequest<any>(`/admin/banners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBanner: (id: string) =>
    apiRequest<{ message: string }>(`/admin/banners/${id}`, { method: 'DELETE' }),
  getCoupons: () => apiRequest<any[]>('/admin/coupons'),
  createCoupon: (data: any) =>
    apiRequest<any>('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
  updateCoupon: (id: string, data: any) =>
    apiRequest<any>(`/admin/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCoupon: (id: string) =>
    apiRequest<{ message: string }>(`/admin/coupons/${id}`, { method: 'DELETE' }),
  getReviews: () => apiRequest<any[]>('/admin/reviews'),
  updateReview: (id: string, data: { isApproved: boolean }) =>
    apiRequest<any>(`/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Customer API
export const customerAPI = {
  getProfile: (userId: string) => apiRequest<any>(`/customers/profile/${userId}`),
  updateProfile: (userId: string, data: { name?: string; phone?: string }) =>
    apiRequest<any>(`/customers/profile/${userId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getAddresses: (userId: string) => apiRequest<any[]>(`/customers/addresses/${userId}`),
  createAddress: (data: any) =>
    apiRequest<any>('/customers/addresses', { method: 'POST', body: JSON.stringify(data) }),
  updateAddress: (id: string, data: any) =>
    apiRequest<any>(`/customers/addresses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAddress: (id: string) =>
    apiRequest<{ message: string }>(`/customers/addresses/${id}`, { method: 'DELETE' }),
  getOrders: (userId: string) => apiRequest<any[]>(`/customers/orders/${userId}`),
};

// Enquiry API (for contact form)
export const enquiryAPI = {
  create: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
    apiRequest<any>('/enquiries', { method: 'POST', body: JSON.stringify(data) }),
};

// Reviews API (alias for consistency)
export const reviewAPI = {
  getByProductId: (productId: string) => reviewsAPI.getByProduct(productId),
  create: (review: any) => reviewsAPI.create(review),
};

// Settings API
export const settingsAPI = {
  get: () => apiRequest<any>('/admin/settings'),
  save: (data: any) => apiRequest<any>('/admin/settings', { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiRequest<any>('/admin/settings/change-password', { method: 'POST', body: JSON.stringify(data) }),
};

