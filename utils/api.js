// utils/api.js
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://hisoblyback.uz:9090';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      toast.error('У вас нет прав для выполнения этого действия');
    } else if (error.response?.status === 404) {
      toast.error('Ресурс не найден');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Произошла ошибка');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Tenant APIs
export const tenantAPI = {
  getMe: () => api.get('/tenants/me'),
  activate: () => api.post('/tenants/activate'),
  getStats: () => api.get('/tenants/stats'),
  getList: (params) => api.get('/tenants/list', { params }),
};

// Store APIs
export const storeAPI = {
  list: () => api.get('/stores'),
  create: (data) => api.post('/stores', data),
  get: (id) => api.get(`/stores/${id}`),
  update: (id, data) => api.patch(`/stores/${id}`, data),
  delete: (id) => api.delete(`/stores/${id}`),
};

// Warehouse APIs
export const warehouseAPI = {
  list: () => api.get('/warehouses'),
  create: (data) => api.post('/warehouses', data),
  get: (id) => api.get(`/warehouses/${id}`),
  update: (id, data) => api.patch(`/warehouses/${id}`, data),
  delete: (id) => api.delete(`/warehouses/${id}`),
};

// Product APIs
export const productAPI = {
  list: (etag) => {
    const config = {};
    if (etag) {
      config.headers = { 'If-None-Match': etag };
    }
    return api.get('/products', config);
  },
  create: (data) => api.post('/products', data),
  get: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getByBarcode: (code) => api.get(`/products/by-barcode/${code}`),
  getBySku: (sku) => api.get(`/products/by-sku/${sku}`),
  getByName: (name) => api.get(`/products/by-name/${name}`),
  getByCategory: (categoryId) => api.get(`/products/by-category/${categoryId}`),
};

// Discount APIs
export const discountAPI = {
  list: () => api.get('/discounts'),
  create: (data) => api.post('/discounts', data),
  get: (id) => api.get(`/discounts/${id}`),
  update: (id, data) => api.patch(`/discounts/${id}`, data),
  delete: (id) => api.delete(`/discounts/${id}`),
};

// Sales APIs
export const salesAPI = {
  list: (params) => api.get('/sales', { params }),
  create: (data) => api.post('/sales', data),
  get: (id) => api.get(`/sales/${id}`),
};

// Returns APIs
export const returnsAPI = {
  list: (params) => api.get('/returns', { params }),
  create: (data) => api.post('/returns', data),
  get: (id) => api.get(`/returns/${id}`),
  delete: (id) => api.delete(`/returns/${id}`),
  getForSale: (saleId) => api.get(`/returns/for-sale/${saleId}`),
};

// Cash Shift APIs
export const cashShiftAPI = {
  list: () => api.get('/cashshifts'),
  open: (data) => api.post('/cashshifts', data),
  close: (id) => api.post(`/cashshifts/${id}/close`),
};

// Inventory APIs
export const inventoryAPI = {
  getStock: (params) => api.get('/inventory/stock', { params }),
};

// Sync APIs
export const syncAPI = {
  pull: (params) => api.get('/sync/pull', { params }),
  push: (data) => api.post('/sync/push', data),
};

export default api;
