// utils/api.js
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Route all API traffic through Next.js route handlers
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  // Do not set Content-Type globally; set per request in interceptor
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

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Tenant APIs
export const tenantAPI = {
  getMe: () => api.get('/tenants/me'),
  activate: () => api.post('/tenants/activate'),
  getStats: () => api.get('/tenants/stats'),
  getList: (params) => api.get('/tenants/list', { params }),
  update: (id, data) => api.patch(`/tenants/${id}`, data),
  getSettings: () => api.get('/tenants/settings'),
  updateSettings: (data) => api.patch('/tenants/settings', data),
};

// Store APIs
export const storeAPI = {
  list: (params) => api.get('/stores', { params }),
  create: (data) => api.post('/stores', data),
  get: (id) => api.get(`/stores/${id}`),
  update: (id, data) => api.patch(`/stores/${id}`, data),
  delete: (id) => api.delete(`/stores/${id}`),
  getStats: (id) => api.get(`/stores/${id}/stats`),
};

// Warehouse APIs
export const warehouseAPI = {
  list: (params) => api.get('/warehouses', { params }),
  create: (data) => api.post('/warehouses', data),
  get: (id) => api.get(`/warehouses/${id}`),
  update: (id, data) => api.patch(`/warehouses/${id}`, data),
  delete: (id) => api.delete(`/warehouses/${id}`),
  getStock: (id) => api.get(`/warehouses/${id}/stock`),
  transfer: (data) => api.post('/warehouses/transfer', data),
};

// Category APIs
export const categoryAPI = {
  list: (params) => api.get('/categories', { params }),
  create: (data) => api.post('/categories', data),
  get: (id) => api.get(`/categories/${id}`),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  getTree: () => api.get('/categories/tree'),
};

// Product APIs
export const productAPI = {
  list: (params) => api.get('/products', { params }),
  create: (data) => api.post('/products', data),
  get: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getByBarcode: (code) => api.get(`/products/by-barcode/${code}`),
  getBySku: (sku) => api.get(`/products/by-sku/${sku}`),
  getByName: (name) => api.get(`/products/by-name/${name}`),
  getByCategory: (categoryId) => api.get(`/products/by-category/${categoryId}`),
  bulkImport: (data) => api.post('/products/bulk-import', data),
  export: (params) => api.get('/products/export', { params, responseType: 'blob' }),
};

// Discount APIs
export const discountAPI = {
  list: (params) => api.get('/discounts', { params }),
  create: (data) => api.post('/discounts', data),
  get: (id) => api.get(`/discounts/${id}`),
  update: (id, data) => api.patch(`/discounts/${id}`, data),
  delete: (id) => api.delete(`/discounts/${id}`),
  activate: (id) => api.post(`/discounts/${id}/activate`),
  deactivate: (id) => api.post(`/discounts/${id}/deactivate`),
};

// Sales APIs
export const salesAPI = {
  list: (params) => api.get('/sales', { params }),
  create: (data) => api.post('/sales', data),
  get: (id) => api.get(`/sales/${id}`),
  update: (id, data) => api.patch(`/sales/${id}`, data),
  delete: (id) => api.delete(`/sales/${id}`),
  getReceipt: (id) => api.get(`/sales/${id}/receipt`),
  sendReceipt: (id, data) => api.post(`/sales/${id}/send-receipt`, data),
  getStats: (params) => api.get('/sales/stats', { params }),
  export: (params) => api.get('/sales/export', { params, responseType: 'blob' }),
};

// Returns APIs
export const returnsAPI = {
  list: (params) => api.get('/returns', { params }),
  create: (data) => api.post('/returns', data),
  get: (id) => api.get(`/returns/${id}`),
  update: (id, data) => api.patch(`/returns/${id}`, data),
  delete: (id) => api.delete(`/returns/${id}`),
  getForSale: (saleId) => api.get(`/returns/for-sale/${saleId}`),
  approve: (id) => api.post(`/returns/${id}/approve`),
  reject: (id) => api.post(`/returns/${id}/reject`),
};

// Customer APIs
export const customerAPI = {
  list: (params) => api.get('/customers', { params, suppressToast: true }),
  create: (data) => api.post('/customers', data),
  get: (id) => api.get(`/customers/${id}`),
  update: (id, data) => api.patch(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getHistory: (id, params) => api.get(`/customers/${id}/history`, { params }),
  getStats: (id) => api.get(`/customers/${id}/stats`),
};

// Employee APIs
export const employeeAPI = {
  list: (params) => api.get('/employees', { params }),
  create: (data) => api.post('/employees', data),
  get: (id) => api.get(`/employees/${id}`),
  update: (id, data) => api.patch(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getStats: (id) => api.get(`/employees/${id}/stats`),
  getSchedule: (id, params) => api.get(`/employees/${id}/schedule`, { params }),
  setSchedule: (id, data) => api.post(`/employees/${id}/schedule`, data),
  getTimesheet: (id, params) => api.get(`/employees/${id}/timesheet`, { params }),
};

// Role APIs
export const roleAPI = {
  list: () => api.get('/roles'),
  create: (data) => api.post('/roles', data),
  get: (id) => api.get(`/roles/${id}`),
  update: (id, data) => api.patch(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
  getPermissions: (id) => api.get(`/roles/${id}/permissions`),
  setPermissions: (id, data) => api.post(`/roles/${id}/permissions`, data),
};

// Cash Shift APIs
export const cashShiftAPI = {
  list: (params) => api.get('/cashshifts', { params }),
  open: (data) => api.post('/cashshifts', data),
  close: (id, data) => api.post(`/cashshifts/${id}/close`, data),
  get: (id) => api.get(`/cashshifts/${id}`),
  getCurrent: () => api.get('/cashshifts/current'),
  getReport: (id) => api.get(`/cashshifts/${id}/report`),
};

// Inventory APIs
export const inventoryAPI = {
  getStock: (params) => api.get('/inventory/stock', { params }),
  adjustStock: (data) => api.post('/inventory/adjust', data),
  getMovements: (params) => api.get('/inventory/movements', { params }),
  createMovement: (data) => api.post('/inventory/movements', data),
  getLowStock: (params) => api.get('/inventory/low-stock', { params, suppressToast: true }),
  getExpiring: (params) => api.get('/inventory/expiring', { params }),
  stocktake: (data) => api.post('/inventory/stocktake', data),
  getStocktakes: (params) => api.get('/inventory/stocktakes', { params }),
};

// Loyalty Program APIs
export const loyaltyAPI = {
  listPrograms: (params) => api.get('/loyalty/programs', { params }),
  createProgram: (data) => api.post('/loyalty/programs', data),
  getProgram: (id) => api.get(`/loyalty/programs/${id}`),
  updateProgram: (id, data) => api.patch(`/loyalty/programs/${id}`, data),
  deleteProgram: (id) => api.delete(`/loyalty/programs/${id}`),
  getMembers: (programId, params) => api.get(`/loyalty/programs/${programId}/members`, { params }),
  addMember: (programId, data) => api.post(`/loyalty/programs/${programId}/members`, data),
  removeMember: (programId, memberId) => api.delete(`/loyalty/programs/${programId}/members/${memberId}`),
  getPoints: (customerId) => api.get(`/loyalty/customers/${customerId}/points`),
  addPoints: (customerId, data) => api.post(`/loyalty/customers/${customerId}/points`, data),
  redeemPoints: (customerId, data) => api.post(`/loyalty/customers/${customerId}/redeem`, data),
};

// Promotion APIs
export const promotionAPI = {
  list: (params) => api.get('/promotions', { params, suppressToast: true }),
  create: (data) => api.post('/promotions', data),
  get: (id) => api.get(`/promotions/${id}`),
  update: (id, data) => api.patch(`/promotions/${id}`, data),
  delete: (id) => api.delete(`/promotions/${id}`),
  activate: (id) => api.post(`/promotions/${id}/activate`),
  deactivate: (id) => api.post(`/promotions/${id}/deactivate`),
  getStats: (id) => api.get(`/promotions/${id}/stats`),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params, suppressToast: true }),
  getSalesReport: (params) => api.get('/analytics/sales', { params }),
  getProductReport: (params) => api.get('/analytics/products', { params }),
  getCustomerReport: (params) => api.get('/analytics/customers', { params }),
  getFinancialReport: (params) => api.get('/analytics/financial', { params, suppressToast: true }),
  getInventoryReport: (params) => api.get('/analytics/inventory', { params }),
  getTaxReport: (params) => api.get('/analytics/tax', { params }),
  getProfitReport: (params) => api.get('/analytics/profit', { params }),
  getCustomReport: (type, params) => api.get(`/analytics/custom/${type}`, { params }),
  exportReport: (type, params) => api.get(`/analytics/export/${type}`, { params, responseType: 'blob' }),
};

// Integration APIs
export const integrationAPI = {
  list: () => api.get('/integrations'),
  connect: (type, data) => api.post(`/integrations/${type}/connect`, data),
  disconnect: (type) => api.post(`/integrations/${type}/disconnect`),
  getStatus: (type) => api.get(`/integrations/${type}/status`),
  getSettings: (type) => api.get(`/integrations/${type}/settings`),
  updateSettings: (type, data) => api.patch(`/integrations/${type}/settings`, data),
  sync: (type) => api.post(`/integrations/${type}/sync`),
  testConnection: (type) => api.post(`/integrations/${type}/test`),
};

// Settings APIs
export const settingsAPI = {
  getGeneral: () => api.get('/settings/general'),
  updateGeneral: (data) => api.patch('/settings/general', data),
  getCompany: () => api.get('/settings/company'),
  updateCompany: (data) => api.patch('/settings/company', data),
  getLocalization: () => api.get('/settings/localization'),
  updateLocalization: (data) => api.patch('/settings/localization', data),
  getSecurity: () => api.get('/settings/security'),
  updateSecurity: (data) => api.patch('/settings/security', data),
  getNotifications: () => api.get('/settings/notifications'),
  updateNotifications: (data) => api.patch('/settings/notifications', data),
  getBackup: () => api.get('/settings/backup'),
  createBackup: () => api.post('/settings/backup'),
  restoreBackup: (id) => api.post(`/settings/backup/${id}/restore`),
  getDevices: () => api.get('/settings/devices'),
  addDevice: (data) => api.post('/settings/devices', data),
  updateDevice: (id, data) => api.patch(`/settings/devices/${id}`, data),
  deleteDevice: (id) => api.delete(`/settings/devices/${id}`),
  getTaxSettings: () => api.get('/settings/tax'),
  updateTaxSettings: (data) => api.patch('/settings/tax', data),
};

// Supplier APIs
export const supplierAPI = {
  list: (params) => api.get('/suppliers', { params }),
  create: (data) => api.post('/suppliers', data),
  get: (id) => api.get(`/suppliers/${id}`),
  update: (id, data) => api.patch(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  getProducts: (id) => api.get(`/suppliers/${id}/products`),
  getOrders: (id) => api.get(`/suppliers/${id}/orders`),
};

// Purchase Order APIs
export const purchaseOrderAPI = {
  list: (params) => api.get('/purchase-orders', { params }),
  create: (data) => api.post('/purchase-orders', data),
  get: (id) => api.get(`/purchase-orders/${id}`),
  update: (id, data) => api.patch(`/purchase-orders/${id}`, data),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
  approve: (id) => api.post(`/purchase-orders/${id}/approve`),
  receive: (id, data) => api.post(`/purchase-orders/${id}/receive`, data),
  cancel: (id) => api.post(`/purchase-orders/${id}/cancel`),
};

// Sync APIs
export const syncAPI = {
  pull: (params) => api.get('/sync/pull', { params }),
  push: (data) => api.post('/sync/push', data),
  getStatus: () => api.get('/sync/status'),
  getHistory: (params) => api.get('/sync/history', { params }),
  forceSync: () => api.post('/sync/force'),
};

// Notification APIs
export const notificationAPI = {
  list: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// File Upload API
export const fileAPI = {
  upload: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/files/${id}`),
  getUrl: (id) => api.get(`/files/${id}/url`),
};

export default api;
