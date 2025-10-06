// utils/api.js
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Route all API traffic through Next.js route handlers
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    config.headers = config.headers || {};
    // Always send Accept JSON
    if (!config.headers['Accept']) config.headers['Accept'] = 'application/json';
    // Only set Content-Type for requests with a body
    const method = (config.method || 'get').toLowerCase();
    const hasBody = ['post', 'put', 'patch'].includes(method);
    if (hasBody && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    } else if (!hasBody && config.headers['Content-Type']) {
      delete config.headers['Content-Type'];
    }
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const suppress = error?.config?.suppressToast;
    const status = error.response?.status;
    if (status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    if (!suppress) {
      if (status === 403) {
        toast.error('У вас нет прав для выполнения этого действия');
      } else if (status === 404) {
        toast.error('Ресурс не найден');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Произошла ошибка');
      }
    }
    return Promise.reject(error);
  }
);

// ===== ACTUAL BACKEND APIS FROM OPENAPI SPEC =====

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
  list: () => api.get('/products'),
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

// ===== MOCK APIS FOR UI FUNCTIONALITY =====
// These return mock data for features not yet implemented in backend

// Mock Analytics API
export const analyticsAPI = {
  getDashboard: () => Promise.resolve({ 
    data: {
      revenue: 15420000,
      revenueChange: 12.5,
      salesCount: 156,
      salesChange: 8.3,
      customersCount: 89,
      customersChange: 5.2,
      productsCount: 245,
      productsChange: 2.1,
    }
  }),
  getFinancialReport: () => Promise.resolve({
    data: {
      revenue: 15420000,
      expenses: 8750000,
      profit: 6670000,
      taxes: 1926000,
      total: 15420000,
    }
  }),
  getSalesReport: () => Promise.resolve({
    data: {
      totalSales: 15420000,
      averageCheck: 98846,
      topProducts: [],
      topCategories: [],
      hourlyDistribution: [],
      paymentMethods: [
        { method: 'Наличные', amount: 6168000 },
        { method: 'Карта', amount: 7710000 },
        { method: 'Перевод', amount: 1542000 },
      ]
    }
  }),
  getProductReport: () => Promise.resolve({
    data: {
      totalProducts: 245,
      activeProducts: 230,
      topSelling: [],
      lowStock: [],
      categoryDistribution: [],
      turnoverRate: []
    }
  }),
  getCustomerReport: () => Promise.resolve({
    data: {
      totalCustomers: 89,
      newCustomers: 12,
      returningRate: 65,
      topCustomers: [],
      segmentation: [],
      loyaltyMetrics: []
    }
  }),
  getTaxReport: () => Promise.resolve({
    data: { totalTax: 1926000 }
  }),
  getProfitReport: () => Promise.resolve({
    data: { 
      grossProfit: 6670000,
      netProfit: 4744000
    }
  }),
  exportReport: () => Promise.resolve({ data: new Blob() }),
};

// Mock Customer API
export const customerAPI = {
  list: () => Promise.resolve({ data: [] }),
  create: (data) => Promise.resolve({ data: { id: Date.now(), ...data } }),
  get: (id) => Promise.resolve({ data: { id } }),
  update: (id, data) => Promise.resolve({ data: { id, ...data } }),
  delete: (id) => Promise.resolve({ data: true }),
};

// Mock Employee API
export const employeeAPI = {
  list: () => Promise.resolve({ 
    data: [
      {
        id: '1',
        full_name: 'Иван Иванов',
        email: 'ivan@example.com',
        phone: '+998901234567',
        role_id: '1',
        salary_amount: 5000000,
        is_active: true,
      }
    ]
  }),
  create: (data) => Promise.resolve({ data: { id: Date.now(), ...data } }),
  get: (id) => Promise.resolve({ data: { id } }),
  update: (id, data) => Promise.resolve({ data: { id, ...data } }),
  delete: (id) => Promise.resolve({ data: true }),
  setSchedule: (id, data) => Promise.resolve({ data: true }),
};

// Mock Role API
export const roleAPI = {
  list: () => Promise.resolve({ 
    data: [
      { id: '1', name: 'Администратор', description: 'Полный доступ' },
      { id: '2', name: 'Менеджер', description: 'Управление продажами' },
      { id: '3', name: 'Кассир', description: 'Проведение продаж' },
    ]
  }),
};

// Mock Promotion API  
export const promotionAPI = {
  list: () => Promise.resolve({ data: [] }),
};

// Mock Settings API
export const settingsAPI = {
  getGeneral: () => Promise.resolve({ data: {} }),
  updateGeneral: (data) => Promise.resolve({ data }),
};

// Mock Integration API
export const integrationAPI = {
  list: () => Promise.resolve({ data: [] }),
};

// For backward compatibility, keep these as no-ops
export const categoryAPI = {
  list: () => Promise.resolve({ data: [] }),
  create: () => Promise.resolve({ data: {} }),
  get: () => Promise.resolve({ data: {} }),
  update: () => Promise.resolve({ data: {} }),
  delete: () => Promise.resolve({ data: true }),
};

export const loyaltyAPI = {
  listPrograms: () => Promise.resolve({ data: [] }),
};

export const supplierAPI = {
  list: () => Promise.resolve({ data: [] }),
};

export const purchaseOrderAPI = {
  list: () => Promise.resolve({ data: [] }),
};

export const notificationAPI = {
  list: () => Promise.resolve({ data: [] }),
  getUnreadCount: () => Promise.resolve({ data: 0 }),
};

export const fileAPI = {
  upload: () => Promise.resolve({ data: {} }),
  delete: () => Promise.resolve({ data: true }),
};

export default api;