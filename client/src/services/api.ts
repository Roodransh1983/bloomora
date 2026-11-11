const envUrl = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_API_URL : '';
const API_BASE = envUrl ? `${envUrl}/api` : '/api';

function getToken(): string | null {
  return localStorage.getItem('bloomora_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}

export const api = {
  // Auth
  auth: {
    register: (d: Record<string, unknown>) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(d) }),
    login: (d: Record<string, unknown>) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(d) }),
    me: () => request('/auth/me'),
  },

  // Products
  products: {
    list: (params?: Record<string, any>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/products${q}`);
    },
    get: (id: string) => request(`/products/${id}`),
    create: (d: Record<string, unknown>) =>
      request('/products', { method: 'POST', body: JSON.stringify(d) }),
    update: (id: string, d: Record<string, unknown>) =>
      request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    delete: (id: string) =>
      request(`/products/${id}`, { method: 'DELETE' }),
  },

  // Categories
  categories: {
    list: () => request('/categories'),
    get: (slug: string) => request(`/categories/${slug}`),
    create: (d: Record<string, unknown>) =>
      request('/categories', { method: 'POST', body: JSON.stringify(d) }),
    update: (id: string, d: Record<string, unknown>) =>
      request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    delete: (id: string) =>
      request(`/categories/${id}`, { method: 'DELETE' }),
  },

  // Cart
  cart: {
    get: (sessionKey?: string) =>
      request('/cart', {
        headers: sessionKey ? { 'x-session-key': sessionKey } : {},
      }),
    addItem: (d: Record<string, unknown>, sessionKey?: string) =>
      request('/cart/items', {
        method: 'POST',
        body: JSON.stringify(d),
        headers: sessionKey ? { 'x-session-key': sessionKey } : {},
      }),
    updateItem: (itemId: string, quantity: number) =>
      request(`/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    removeItem: (itemId: string) =>
      request(`/cart/items/${itemId}`, { method: 'DELETE' }),
    clear: () => request('/cart', { method: 'DELETE' }),
  },

  // Orders
  orders: {
    create: (d: Record<string, unknown>) =>
      request('/orders', { method: 'POST', body: JSON.stringify(d) }),
    list: () => request('/orders'),
    get: (id: string) => request(`/orders/${id}`),
  },

  // Donations
  donations: {
    submit: (d: Record<string, unknown>) =>
      request('/donations', { method: 'POST', body: JSON.stringify(d) }),
    track: (num: string) => request(`/donations/track/${num}`),
    list: () => request('/donations'),
  },

  // Flower Collections
  flowers: {
    submit: (d: Record<string, unknown>) =>
      request('/flower-collections', { method: 'POST', body: JSON.stringify(d) }),
    track: (num: string) => request(`/flower-collections/track/${num}`),
    list: () => request('/flower-collections'),
  },

  // Reviews
  reviews: {
    list: (productId: string) => request(`/reviews/product/${productId}`),
    submit: (productId: string, d: Record<string, unknown>) =>
      request(`/reviews/product/${productId}`, {
        method: 'POST',
        body: JSON.stringify(d),
      }),
  },

  // Wishlist
  wishlist: {
    get: () => request('/wishlist'),
    add: (productId: string) =>
      request(`/wishlist/${productId}`, { method: 'POST' }),
    remove: (productId: string) =>
      request(`/wishlist/${productId}`, { method: 'DELETE' }),
  },

  // Coupons
  coupons: {
    validate: (d: Record<string, unknown>) =>
      request('/coupons/validate', { method: 'POST', body: JSON.stringify(d) }),
    list: () => request('/coupons'),
  },

  // Media
  media: {
    upload: (formData: FormData) => upload('/media/upload', formData),
    uploadMultiple: (formData: FormData) =>
      upload('/media/upload-multiple', formData),
    list: () => request('/media'),
    delete: (id: string) => request(`/media/${id}`, { method: 'DELETE' }),
  },

  // Newsletter
  newsletter: {
    subscribe: (email: string) =>
      request('/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  // Content
  content: {
    list: () => request('/content'),
    get: (key: string) => request(`/content/${key}`),
    update: (key: string, d: any) =>
      request(`/content/${key}`, { method: 'PUT', body: JSON.stringify(d) }),
  },

  // Admin
  admin: {
    staff: () => request('/admin/staff'),
    createStaff: (d: { name: string; email: string }) =>
      request('/admin/staff', { method: 'POST', body: JSON.stringify(d) }),
    dashboard: () => request('/admin/dashboard'),
    orders: (params?: Record<string, string>) =>
      request(
        `/admin/orders${params ? '?' + new URLSearchParams(params) : ''}`
      ),
    updateOrderStatus: (id: string, status: string) =>
      request(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    donations: (params?: Record<string, string>) =>
      request(
        `/admin/donations${params ? '?' + new URLSearchParams(params) : ''}`
      ),
    updateDonationStatus: (id: string, d: Record<string, unknown>) =>
      request(`/admin/donations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(d),
      }),
    flowerCollections: () => request('/admin/flower-collections'),
    updateFlowerStatus: (id: string, d: Record<string, unknown>) =>
      request(`/admin/flower-collections/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(d),
      }),
    customers: () => request('/admin/customers'),
    reviews: () => request('/admin/reviews'),
    updateReview: (id: string, d: Record<string, unknown>) =>
      request(`/admin/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(d),
      }),
    analytics: () => request('/admin/analytics'),
    coupons: () => request('/coupons'),
    createCoupon: (d: Record<string, unknown>) =>
      request('/coupons', { method: 'POST', body: JSON.stringify(d) }),
    updateCoupon: (id: string, d: Record<string, unknown>) =>
      request(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    deleteCoupon: (id: string) =>
      request(`/coupons/${id}`, { method: 'DELETE' }),
  },

  // User profile
  user: {
    profile: () => request('/users/profile'),
    updateProfile: (d: Record<string, unknown>) =>
      request('/users/profile', { method: 'PUT', body: JSON.stringify(d) }),
    changePassword: (d: Record<string, unknown>) =>
      request('/users/password', { method: 'PUT', body: JSON.stringify(d) }),
    addresses: () => request('/users/addresses'),
    addAddress: (d: Record<string, unknown>) =>
      request('/users/addresses', { method: 'POST', body: JSON.stringify(d) }),
    updateAddress: (id: string, d: Record<string, unknown>) =>
      request(`/users/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(d),
      }),
    deleteAddress: (id: string) =>
      request(`/users/addresses/${id}`, { method: 'DELETE' }),
    orders: () => request('/users/orders'),
    donations: () => request('/users/donations'),
    flowerCollections: () => request('/users/flower-collections'),
  },
};
