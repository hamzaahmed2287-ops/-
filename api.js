// src/utils/api.js

// تحديد رابط السيرفر أوتوماتيكياً سواء فتحت من الكمبيوتر (localhost) أو الموبايل (192.168.x.x)
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

const getLocal = (key, fallback = '[]') => {
  if (typeof window === 'undefined') {
    try { return JSON.parse(fallback); } catch (e) { return null; }
  }
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : JSON.parse(fallback);
  } catch (e) {
    try { return JSON.parse(fallback); } catch { return null; }
  }
};

export const api = {
  // --- البراندات (Brands) ---
  async getBrands() {
    try {
      const res = await fetch(`${API_BASE_URL}/brands`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch brands');
      return await res.json();
    } catch (err) {
      console.warn('API error, falling back to localStorage for brands');
      return getLocal('kashafa_admin_brands', '[]');
    }
  },

  async saveBrands(brandsData) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kashafa_admin_token') : null;
      const res = await fetch(`${API_BASE_URL}/brands`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(brandsData)
      });
      if (!res.ok) throw new Error('Failed to save brands to DB');
      return await res.json();
    } catch (err) {
      console.error('Error saving brands in DB:', err);
      return null;
    }
  },

  // --- المنتجات ---
  async getProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/store/products`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch products');
      return await res.json();
    } catch (err) {
      console.warn('API error, falling back to localStorage for products');
      return getLocal('kashafa_admin_products', getLocal('kashafa_products', '[]'));
    }
  },

  async createProduct(productData) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kashafa_admin_token') : null;
      const res = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(productData)
      });
      return await res.json();
    } catch (err) {
      console.error('Error creating product in DB', err);
      throw err;
    }
  },

  async deleteProduct(id) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kashafa_admin_token') : null;
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      return await res.json();
    } catch (err) {
      console.error('Error deleting product', err);
    }
  },

  // --- الطلبات (Orders) ---
  async createOrder(orderData) {
    try {
      const res = await fetch(`${API_BASE_URL}/store/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return await res.json();
    } catch (err) {
      console.warn('API error, saving order locally');
      return null;
    }
  },

  async getOrders() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kashafa_admin_token') : null;
      const res = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      return await res.json();
    } catch (err) {
      return getLocal('kashafa_admin_orders', getLocal('kashafa_orders', '[]'));
    }
  },

  // --- المستخدمين (Users) ---
  async getUsers() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    } catch (err) {
      return getLocal('kashafa_users', '[]');
    }
  },

  // --- إعدادات الشحن والدفع ---
  async getShippingRates() {
    try {
      const res = await fetch(`${API_BASE_URL}/store/shipping-rates`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (err) {
      return getLocal('kashafa_shipping_rates', '[]');
    }
  },

  async getPaymentSettings() {
    try {
      const res = await fetch(`${API_BASE_URL}/store/payment-settings`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (err) {
      return getLocal('kashafa_payment_settings', 'null');
    }
  }
};