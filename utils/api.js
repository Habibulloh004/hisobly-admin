// utils/api.js
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Route all API traffic through Next.js route handlers
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
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

// Response interceptor for error handling
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

// Product APIs - Fixed to ensure proper data types
export const productAPI = {
  list: () => api.get('/products'),
  create: (data) => {
    // Ensure we only send required fields with correct types
    const payload = {
      name: data.name, // required
      price: parseFloat(data.price) || 0, // required
    };
    
    // Add optional fields only if they have values
    if (data.sku && data.sku.trim()) payload.sku = data.sku.trim();
    if (data.barcode && data.barcode.trim()) payload.barcode = data.barcode.trim();
    if (data.cost !== undefined && data.cost !== '') payload.cost = parseFloat(data.cost) || 0;
    // Only send category_id if it looks like a UUID (backend expects uuid format)
    if (data.category_id && /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(String(data.category_id).trim())) {
      payload.category_id = String(data.category_id).trim();
    }
    if (data.tax_id && data.tax_id.trim()) payload.tax_id = data.tax_id.trim();
    if (data.is_active !== undefined) payload.is_active = Boolean(data.is_active);
    // Normalize unit codes to backend values; ignore UI labels like 'шт'
    if (data.unit && data.unit !== 'pcs') {
      const unit = String(data.unit).trim();
      const allowed = new Set(['pcs','kg','g','l','ml','m','m2','m3','box','pack']);
      if (allowed.has(unit)) payload.unit = unit; // only send if valid
    }
    if (data.unit_code && data.unit_code.trim()) payload.unit_code = data.unit_code.trim();
    if (data.ikpu_code && data.ikpu_code.trim()) payload.ikpu_code = data.ikpu_code.trim();
    if (data.comment && data.comment.trim()) payload.comment = data.comment.trim();
    
    return api.post('/products', payload);
  },
  get: (id) => api.get(`/products/${id}`),
  update: (id, data) => {
    const payload = {};
    
    // Add all fields that are being updated
    if (data.name !== undefined) payload.name = data.name;
    if (data.price !== undefined) payload.price = parseFloat(data.price) || 0;
    if (data.sku !== undefined) payload.sku = data.sku.trim() || null;
    if (data.barcode !== undefined) payload.barcode = data.barcode.trim() || null;
    if (data.cost !== undefined) payload.cost = parseFloat(data.cost) || 0;
    if (data.category_id !== undefined) {
      const cid = String(data.category_id).trim();
      payload.category_id = cid
        ? (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(cid) ? cid : null)
        : null;
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

// Discount APIs - Fixed data types
export const discountAPI = {
  list: () => api.get('/discounts'),
  create: (data) => {
    const payload = {
      name: data.name
    };
    
    // Add only one discount type
    if (data.percent && parseFloat(data.percent) > 0) {
      payload.percent = parseFloat(data.percent);
    } else if (data.amount_fixed && parseFloat(data.amount_fixed) > 0) {
      payload.amount_fixed = parseFloat(data.amount_fixed);
    } else if (data.amount && parseFloat(data.amount) > 0) {
      payload.amount = parseFloat(data.amount);
    }
    
    // Optional fields
    if (data.active !== undefined) payload.active = Boolean(data.active);
    if (data.valid_from) payload.valid_from = data.valid_from;
    if (data.valid_to) payload.valid_to = data.valid_to;
    
    return api.post('/discounts', payload);
  },
  get: (id) => api.get(`/discounts/${id}`),
  update: (id, data) => {
    const payload = {};
    
    if (data.name !== undefined) payload.name = data.name;
    
    // Update discount type if provided
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

// Sales APIs - Fixed to include required structure
export const salesAPI = {
  list: (params) => api.get('/sales', { params }),
  create: (data) => {
    // Ensure proper structure for sales
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

// Returns APIs - Fixed data types
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

// Cash Shift APIs - Fixed data types
export const cashShiftAPI = {
  list: () => api.get('/cashshifts'),
  open: (data) => {
    const payload = {
      store_id: data.store_id,
      opening_cash: parseFloat(data.opening_cash) || 0
    };
    return api.post('/cashshifts', payload);
  },
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

// Mock Employee API (backend doesn't have this)
export const employeeAPI = {
  list: (params) => Promise.resolve({ 
    data: [
      {
        id: '1',
        full_name: 'Иван Иванов',
        email: 'ivan@example.com',
        phone: '+998901234567',
        role_id: '1',
        gender: 'male',
        birth_date: '1990-01-01',
        address: 'г. Ташкент',
        serial_number: 'AB1234567',
        salary_type: 'monthly',
        salary_amount: 5000000,
        hire_date: '2023-01-01',
        is_active: true,
      },
      {
        id: '2',
        full_name: 'Мария Петрова',
        email: 'maria@example.com',
        phone: '+998901234568',
        role_id: '2',
        gender: 'female',
        birth_date: '1992-05-15',
        address: 'г. Самарканд',
        serial_number: 'CD5678901',
        salary_type: 'monthly',
        salary_amount: 4000000,
        hire_date: '2023-06-01',
        is_active: true,
      }
    ]
  }),
  create: (data) => Promise.resolve({ 
    data: { 
      id: Date.now().toString(), 
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } 
  }),
  get: (id) => Promise.resolve({ 
    data: { 
      id,
      full_name: 'Тестовый сотрудник',
      email: 'test@example.com',
      phone: '+998901234567',
      role_id: '1',
      salary_amount: 3000000,
      is_active: true
    } 
  }),
  update: (id, data) => Promise.resolve({ 
    data: { 
      id, 
      ...data,
      updated_at: new Date().toISOString()
    } 
  }),
  delete: (id) => Promise.resolve({ data: true }),
  setSchedule: (id, data) => Promise.resolve({ data: true }),
};

// Mock Role API (backend doesn't have this)
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

// Mock Category API (backend doesn't have this)
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

// Settings API (backend doesn't have this - store in localStorage)
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
  getEquipment: () => Promise.resolve({
    data: [
      {
        id: '1',
        name: 'Epson E956',
        type: 'Принтер',
        language: 'Русский',
        currency: 'Узбекский Сум',
        version: '165A53'
      }
    ]
  }),
  addEquipment: (data) => Promise.resolve({ 
    data: { id: Date.now().toString(), ...data } 
  }),
  updateEquipment: (id, data) => Promise.resolve({ 
    data: { id, ...data } 
  }),
  deleteEquipment: (id) => Promise.resolve({ data: true })
};

// For backward compatibility
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
};

export const customerAPI = {
  list: () => Promise.resolve({ data: [] }),
  create: (data) => Promise.resolve({ data: { id: Date.now(), ...data } }),
  get: (id) => Promise.resolve({ data: { id } }),
  update: (id, data) => Promise.resolve({ data: { id, ...data } }),
  delete: (id) => Promise.resolve({ data: true }),
};

export const promotionAPI = {
  list: () => Promise.resolve({ data: [] }),
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

export const integrationAPI = {
  list: () => Promise.resolve({ data: [] }),
};

export default api;
