// utils/api.js
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://hisoblyback.uz:9090';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const suppress = error?.config?.suppressToast;
    const status = error.response?.status;
    
    if (status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
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
      } else if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach(msg => toast.error(msg));
      } else {
        toast.error('Произошла ошибка');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const tenantAPI = {
  getMe: () => api.get('/tenants/me'),
  activate: () => api.post('/tenants/activate'),
  getStats: () => api.get('/tenants/stats'),
  getList: (params) => api.get('/tenants/list', { params }),
};

export const storeAPI = {
  list: () => api.get('/stores'),
  create: (data) => api.post('/stores', data),
  get: (id) => api.get(`/stores/${id}`),
  update: (id, data) => api.patch(`/stores/${id}`, data),
  delete: (id) => api.delete(`/stores/${id}`),
};

export const warehouseAPI = {
  list: () => api.get('/warehouses'),
  create: (data) => api.post('/warehouses', data),
  get: (id) => api.get(`/warehouses/${id}`),
  update: (id, data) => api.patch(`/warehouses/${id}`, data),
  delete: (id) => api.delete(`/warehouses/${id}`),
};

export const productAPI = {
  list: () => api.get('/products'),
  create: (data) => {
    const payload = { name: data.name, price: parseFloat(data.price) || 0 };
    if (data.sku && data.sku.trim()) payload.sku = data.sku.trim();
    if (data.barcode && data.barcode.trim()) payload.barcode = data.barcode.trim();
    if (data.cost !== undefined && data.cost !== '') payload.cost = parseFloat(data.cost) || 0;
    if (data.category_id && /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(String(data.category_id).trim())) {
      payload.category_id = String(data.category_id).trim();
    }
    if (data.tax_id && data.tax_id.trim()) payload.tax_id = data.tax_id.trim();
    if (data.is_active !== undefined) payload.is_active = Boolean(data.is_active);
    if (data.unit && data.unit !== 'pcs') {
      const unit = String(data.unit).trim();
      const allowed = new Set(['pcs','kg','g','l','ml','m','m2','m3','box','pack']);
      if (allowed.has(unit)) payload.unit = unit;
    }
    if (data.unit_code && data.unit_code.trim()) payload.unit_code = data.unit_code.trim();
    if (data.ikpu_code && data.ikpu_code.trim()) payload.ikpu_code = data.ikpu_code.trim();
    if (data.comment && data.comment.trim()) payload.comment = data.comment.trim();
    return api.post('/products', payload);
  },
  get: (id) => api.get(`/products/${id}`),
  update: (id, data) => {
    const payload = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.price !== undefined) payload.price = parseFloat(data.price) || 0;
    if (data.sku !== undefined) payload.sku = data.sku.trim() || null;
    if (data.barcode !== undefined) payload.barcode = data.barcode.trim() || null;
    if (data.cost !== undefined) payload.cost = parseFloat(data.cost) || 0;
    if (data.category_id !== undefined) {
      const cid = String(data.category_id).trim();
      payload.category_id = cid ? (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(cid) ? cid : null) : null;
    }
    if (data.tax_id !== undefined) payload.tax_id = data.tax_id.trim() || null;
    if (data.is_active !== undefined) payload.is_active = Boolean(data.is_active);
    if (data.unit !== undefined) {
      const unit = String(data.unit || '').trim();
      const allowed = new Set(['pcs','kg','g','l','ml','m','m2','m3','box','pack']);
      payload.unit = allowed.has(unit) ? unit : 'pcs';
    }
    if (data.unit_code !== undefined) payload.unit_code = data.unit_code.trim() || null;
    if (data.ikpu_code !== undefined) payload.ikpu_code = data.ikpu_code.trim() || null;
    if (data.comment !== undefined) payload.comment = data.comment.trim() || null;
    return api.patch(`/products/${id}`, payload);
  },
  delete: (id) => api.delete(`/products/${id}`),
  getByBarcode: (code) => api.get(`/products/by-barcode/${encodeURIComponent(code)}`),
  getBySku: (sku) => api.get(`/products/by-sku/${encodeURIComponent(sku)}`),
  getByName: (name) => api.get(`/products/by-name/${encodeURIComponent(name)}`),
  getByCategory: (categoryId) => api.get(`/products/by-category/${categoryId}`),
};

export const discountAPI = {
  list: () => api.get('/discounts'),
  create: (data) => {
    const payload = { name: data.name };
    if (data.percent && parseFloat(data.percent) > 0) payload.percent = parseFloat(data.percent);
    else if (data.amount_fixed && parseFloat(data.amount_fixed) > 0) payload.amount_fixed = parseFloat(data.amount_fixed);
    else if (data.amount && parseFloat(data.amount) > 0) payload.amount = parseFloat(data.amount);
    if (data.active !== undefined) payload.active = Boolean(data.active);
    if (data.valid_from) payload.valid_from = data.valid_from;
    if (data.valid_to) payload.valid_to = data.valid_to;
    return api.post('/discounts', payload);
  },
  get: (id) => api.get(`/discounts/${id}`),
  update: (id, data) => {
    const payload = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.percent !== undefined) payload.percent = data.percent ? parseFloat(data.percent) : null;
    if (data.amount !== undefined) payload.amount = data.amount ? parseFloat(data.amount) : null;
    if (data.amount_fixed !== undefined) payload.amount_fixed = data.amount_fixed ? parseFloat(data.amount_fixed) : null;
    if (data.active !== undefined) payload.active = Boolean(data.active);
    if (data.valid_from !== undefined) payload.valid_from = data.valid_from || null;
    if (data.valid_to !== undefined) payload.valid_to = data.valid_to || null;
    return api.patch(`/discounts/${id}`, payload);
  },
  delete: (id) => api.delete(`/discounts/${id}`),
};

export const salesAPI = {
  list: (params) => api.get('/sales', { params }),
  create: (data) => {
    const payload = {
      store_id: data.store_id,
      warehouse_id: data.warehouse_id || null,
      discount_id: data.discount_id || null,
      items: data.items.map(item => ({
        product_id: item.product_id,
        qty: parseFloat(item.qty) || 0,
        price: parseFloat(item.price) || 0,
        discount: parseFloat(item.discount) || 0,
        tax_rate: parseFloat(item.tax_rate) || 0
      })),
      payments: data.payments ? data.payments.map(payment => ({
        type: payment.type,
        amount: parseFloat(payment.amount) || 0
      })) : [],
      note: data.note || null
    };
    return api.post('/sales', payload);
  },
  get: (id) => api.get(`/sales/${id}`),
};

export const returnsAPI = {
  list: (params) => api.get('/returns', { params }),
  create: (data) => {
    const payload = {
      sale_id: data.sale_id,
      product_id: data.product_id,
      qty: parseFloat(data.qty) || 0,
      reason: data.reason || null,
      amount: data.amount ? parseFloat(data.amount) : null
    };
    return api.post('/returns', payload);
  },
  get: (id) => api.get(`/returns/${id}`),
  delete: (id) => api.delete(`/returns/${id}`),
  getForSale: (saleId) => api.get(`/returns/for-sale/${saleId}`),
};

export const cashShiftAPI = {
  list: () => api.get('/cashshifts'),
  open: (data) => {
    const payload = { store_id: data.store_id, opening_cash: parseFloat(data.opening_cash) || 0 };
    return api.post('/cashshifts', payload);
  },
  close: (id) => api.post(`/cashshifts/${id}/close`),
};

export const inventoryAPI = {
  getStock: (params) => api.get('/inventory/stock', { params }),
};

export const syncAPI = {
  pull: (params) => api.get('/sync/pull', { params }),
  push: (data) => api.post('/sync/push', data),
};

export const employeeAPI = {
  list: (params) => Promise.resolve({ data: [] }),
  create: (data) => Promise.resolve({ data: { id: Date.now().toString(), ...data } }),
  get: (id) => Promise.resolve({ data: { id } }),
  update: (id, data) => Promise.resolve({ data: { id, ...data } }),
  delete: (id) => Promise.resolve({ data: true }),
  setSchedule: (id, data) => Promise.resolve({ data: true }),
};

export const roleAPI = {
  list: () => Promise.resolve({ 
    data: [
      { id: '1', name: 'owner', description: 'Владелец - полный доступ' },
      { id: '2', name: 'manager', description: 'Менеджер - управление продажами' },
      { id: '3', name: 'cashier', description: 'Кассир - проведение продаж' },
      { id: '4', name: 'accountant', description: 'Бухгалтер - финансовые отчеты' },
    ]
  }),
};

export const categoryAPI = {
  list: () => Promise.resolve({ 
    data: [
      { id: '1', name: 'Электроника' },
      { id: '2', name: 'Одежда' },
      { id: '3', name: 'Продукты' },
      { id: '4', name: 'Бытовая техника' },
      { id: '5', name: 'Другое' }
    ]
  }),
  create: (data) => Promise.resolve({ data: { id: Date.now().toString(), ...data } }),
  get: (id) => Promise.resolve({ data: { id, name: 'Категория' } }),
  update: (id, data) => Promise.resolve({ data: { id, ...data } }),
  delete: (id) => Promise.resolve({ data: true }),
};

export const settingsAPI = {
  getGeneral: () => {
    const settings = localStorage.getItem('app_settings');
    return Promise.resolve({ 
      data: settings ? JSON.parse(settings) : {
        company_name: 'Hisobly',
        inn: '',
        address: '',
        phone: '',
        language: 'ru',
        currency: 'UZS',
        timezone: 'UTC+5',
        date_format: 'DD/MM/YYYY',
        backup_enabled: true,
        backup_frequency: 'daily'
      }
    });
  },
  updateGeneral: (data) => {
    localStorage.setItem('app_settings', JSON.stringify(data));
    return Promise.resolve({ data });
  },
  getPayments: () => {
    const settings = localStorage.getItem('settings_payments');
    return Promise.resolve({
      data: settings ? JSON.parse(settings) : {
        enabled_methods: {
          cash: true,
          card: true,
          Click: false,
          Payme: false,
          Uzumbank: false,
          Bonus: false,
          Certificate: false,
          Others: true
        },
        default_method: 'cash',
        gateways: {
          Click: { merchant_id: '', service_id: '', secret_key: '' },
          Payme: { merchant_id: '', test_mode: false },
          Uzumbank: { merchant_id: '', terminal_id: '', secret_key: '' }
        },
        receipt_settings: {
          show_payment_details: true,
          show_change: true,
          split_payments: true
        }
      }
    });
  },
  updatePayments: (data) => {
    localStorage.setItem('settings_payments', JSON.stringify(data));
    return Promise.resolve({ data });
  },
  getEquipment: () => Promise.resolve({ data: [] }),
  addEquipment: (data) => Promise.resolve({ data: { id: Date.now().toString(), ...data } }),
  updateEquipment: (id, data) => Promise.resolve({ data: { id, ...data } }),
  deleteEquipment: (id) => Promise.resolve({ data: true })
};

export const analyticsAPI = { getDashboard: () => Promise.resolve({ data: {} }) };
export const customerAPI = { list: () => Promise.resolve({ data: [] }) };
export const promotionAPI = { list: () => Promise.resolve({ data: [] }) };
export const loyaltyAPI = { listPrograms: () => Promise.resolve({ data: [] }) };
export const supplierAPI = { list: () => Promise.resolve({ data: [] }) };
export const purchaseOrderAPI = { list: () => Promise.resolve({ data: [] }) };
export const notificationAPI = { list: () => Promise.resolve({ data: [] }), getUnreadCount: () => Promise.resolve({ data: 0 }) };
export const fileAPI = { upload: () => Promise.resolve({ data: {} }), delete: () => Promise.resolve({ data: true }) };
export const integrationAPI = { list: () => Promise.resolve({ data: [] }) };

// Payment Helper Functions
export const getEnabledPaymentMethods = () => {
  const settings = localStorage.getItem('settings_payments');
  if (!settings) return ['cash', 'card', 'Others'];
  const parsed = JSON.parse(settings);
  return Object.entries(parsed.enabled_methods).filter(([_, enabled]) => enabled).map(([method]) => method);
};

export const getDefaultPaymentMethod = () => {
  const settings = localStorage.getItem('settings_payments');
  if (!settings) return 'cash';
  const parsed = JSON.parse(settings);
  return parsed.default_method || 'cash';
};

export const getPaymentGatewayConfig = (gateway) => {
  const settings = localStorage.getItem('settings_payments');
  if (!settings) return null;
  const parsed = JSON.parse(settings);
  return parsed.gateways?.[gateway] || null;
};

export const isSplitPaymentsAllowed = () => {
  const settings = localStorage.getItem('settings_payments');
  if (!settings) return true;
  const parsed = JSON.parse(settings);
  return parsed.receipt_settings?.split_payments ?? true;
};

export const getReceiptSettings = () => {
  const settings = localStorage.getItem('settings_payments');
  if (!settings) return { show_payment_details: true, show_change: true, split_payments: true };
  const parsed = JSON.parse(settings);
  return parsed.receipt_settings || { show_payment_details: true, show_change: true, split_payments: true };
};

export default api;