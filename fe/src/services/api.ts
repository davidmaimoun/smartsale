import axios from 'axios';
import type { SalesMetrics, WooCommerceConfig } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export const wooCommerceAPI = {
  // Get sales metrics for a date range
  getSalesMetrics: async (startDate: string, endDate: string): Promise<SalesMetrics> => {
    const response = await api.get('/sales/metrics', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  // Connect WooCommerce connection
  testConnection: async (config: WooCommerceConfig): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/woocommerce/connect', config);
    return response.data;
  },

  // Get AI insights
  getAIInsights: async (startDate: string, endDate: string) => {
    const response = await api.get('/ai/insights', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  // Get product ratings
  getProductRatings: async (limit: number = 10) => {
    const response = await api.get('/products/ratings', {
      params: { limit },
    });
    return response.data;
  },

  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // Get detailed product data (sales, ratings, etc.)
  getProductData: async (productId: number) => {
    const response = await api.get(`/products/${productId}/data`);
    return response.data;
  },

    // Get best sellers all time
  getBestSellers: async (limit: number = 10) => {
    const response = await api.get('/products/best-sellers', {
      params: { limit },
    });
    return response.data;
  },

  // Get store info
  getStoreInfo: async () => {
    const response = await api.get('/woocommerce/store-info');
    return response.data;
    },



  getAllOrders: async() => {
    const response = await api.get('/woocommerce/orders', {
    params: { per_page: 10, status: 'any' },
  });

  return response.data
  },


  // Get order notes (messages inbox) for a specific order
  getOrderNotes: async (orderId: number) => {
    const response = await api.get(`/woocommerce/order-notes/${orderId}`);
    return response.data;
  },

  // Optional: fetch inbox for all recent orders
  getInbox: async (orderIds: number[]) => {
    const promises = orderIds.map((id) => api.get(`/woocommerce/order-notes/${id}`));
    const results = await Promise.all(promises);
    // flatten notes from all orders
    return results.flatMap((res) => res.data.notes || []);
  },
};

export default api;
