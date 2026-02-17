import axios from 'axios';
import type { SalesMetrics, WooCommerceConfig } from '../types';
import { getDemoModeValue } from '../contexts/DemoContext';
import {
  generateDemoMetrics,
  generateDemoRatings,
  generateDemoBestSellers,
  generateDemoProductData,
  DEMO_PRODUCTS,
} from '../utils/demoData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

const delay = (ms = 700) => new Promise((res) => setTimeout(res, ms));

// 🗑️ TO REMOVE LATER: delete all `if (getDemoModeValue())` blocks + imports above
export const wooCommerceAPI = {

  getSalesMetrics: async (startDate: string, endDate: string): Promise<SalesMetrics> => {

    if (getDemoModeValue()) {
      await delay(800);
      return generateDemoMetrics(startDate, endDate);
    }
    const response = await api.get('/sales/metrics', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  testConnection: async (config: WooCommerceConfig): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/woocommerce/connect', config);
    return response.data;
  },

  getAIInsights: async (startDate: string, endDate: string) => {
    const response = await api.get('/ai/insights', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getProductRatings: async (limit = 10) => {
    if (getDemoModeValue()) {
      await delay(700);
      return generateDemoRatings(limit);
    }
    const response = await api.get('/products/ratings', { params: { limit } });
    return response.data;
  },

  getProducts: async () => {
    if (getDemoModeValue()) {
      await delay(600);
      return { products: DEMO_PRODUCTS };
    }
    const response = await api.get('/products');
    return response.data;
  },

  getProductData: async (productId: number) => {
    if (getDemoModeValue()) {
      await delay(500);
      return generateDemoProductData(productId);
    }
    const response = await api.get(`/products/${productId}/data`);
    return response.data;
  },

  getBestSellers: async (limit = 10) => {
    if (getDemoModeValue()) {
      await delay(700);
      return generateDemoBestSellers(limit);
    }
    const response = await api.get('/products/best-sellers', { params: { limit } });
    return response.data;
  },

  getStoreInfo: async () => {
    if (getDemoModeValue()) {
      return { success: true, store_url: '🎭 Demo Store', api_version: 'wc/v3' };
    }
    const response = await api.get('/woocommerce/store-info');
    return response.data;
  },

  getAllOrders: async () => {
    const response = await api.get('/woocommerce/orders', {
      params: { per_page: 10, status: 'any' },
    });
    return response.data;
  },

  getOrderNotes: async (orderId: number) => {
    const response = await api.get(`/woocommerce/order-notes/${orderId}`);
    return response.data;
  },

  getInbox: async (orderIds: number[]) => {
    const results = await Promise.all(
      orderIds.map((id) => api.get(`/woocommerce/order-notes/${id}`))
    );
    return results.flatMap((res) => res.data.notes || []);
  },
};

export default api;