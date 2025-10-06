"use client";
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Edit2, Trash2, Package, Building2, MapPin, X } from 'lucide-react';
import { inventoryAPI, warehouseAPI, productAPI, storeAPI } from '@/utils/api';
import toast from 'react-hot-toast';

export default function Warehouse() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, medium, high
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [editingStore, setEditingStore] = useState(null);
  
  // Forms
  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    code: '',
    store_id: '',
    address: '',
    is_active: true
  });
  
  const [storeForm, setStoreForm] = useState({
    name: '',
    code: '',
    address: '',
    is_active: true
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchInventory();
    }
  }, [selectedWarehouse]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [storesRes, warehousesRes, productsRes] = await Promise.all([
        storeAPI.list(),
        warehouseAPI.list(),
        productAPI.list()
      ]);
      
      setStores(storesRes.data || []);
      setWarehouses(warehousesRes.data || []);
      setProducts(productsRes.data || []);
      
      if (warehousesRes.data && warehousesRes.data.length > 0) {
        setSelectedWarehouse(warehousesRes.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = {
        warehouse_id: selectedWarehouse,
        include: 'warehouse,product',
        limit: 1000
      };
      
      const { data } = await inventoryAPI.getStock(params);
      setInventory(data || []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  // Store management
  const handleCreateStore = async (e) => {
    e.preventDefault();
    
    if (!storeForm.name || !storeForm.code) {
      toast.error('Введите название и код магазина');
      return;
    }
    
    try {
      if (editingStore) {
        await storeAPI.update(editingStore.id, storeForm);
        toast.success('Магазин обновлен');
      } else {
        await storeAPI.create(storeForm);
        toast.success('Магазин создан');
      }
      
      fetchInitialData();
      setShowStoreModal(false);
      resetStoreForm();
    } catch (error) {
      toast.error('Ошибка при сохранении магазина');
    }
  };

  const handleDeleteStore = async (id) => {
    if (confirm('Удалить этот магазин? Все связанные склады также будут затронуты.')) {
      try {
        await storeAPI.delete(id);
        toast.success('Магазин удален');
        fetchInitialData();
      } catch (error) {
        toast.error('Ошибка при удалении магазина');
      }
    }
  };

  const resetStoreForm = () => {
    setEditingStore(null);
    setStoreForm({
      name: '',
      code: '',
      address: '',
      is_active: true
    });
  };

  // Warehouse management
  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    
    if (!warehouseForm.name || !warehouseForm.code || !warehouseForm.store_id) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    
    try {
      if (editingWarehouse) {
        await warehouseAPI.update(editingWarehouse.id, warehouseForm);
        toast.success('Склад обновлен');
      } else {
        await warehouseAPI.create(warehouseForm);
        toast.success('Склад создан');
      }
      
      fetchInitialData();
      setShowWarehouseModal(false);
      resetWarehouseForm();
    } catch (error) {
      toast.error('Ошибка при сохранении склада');
    }
  };

  const handleDeleteWarehouse = async (id) => {
    if (confirm('Удалить этот склад? Вся информация об остатках будет потеряна.')) {
      try {
        await warehouseAPI.delete(id);
        toast.success('Склад удален');
        fetchInitialData();
        
        // Select another warehouse if the deleted one was selected
        if (selectedWarehouse === id && warehouses.length > 1) {
          const remaining = warehouses.filter(w => w.id !== id);
          if (remaining.length > 0) {
            setSelectedWarehouse(remaining[0].id);
          }
        }
      } catch (error) {
        toast.error('Ошибка при удалении склада');
      }
    }
  };

  const resetWarehouseForm = () => {
    setEditingWarehouse(null);
    setWarehouseForm({
      name: '',
      code: '',
      store_id: stores.length > 0 ? stores[0].id : '',
      address: '',
      is_active: true
    });
  };

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    // Search filter
    const matchesSearch = 
      item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product?.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product?.barcode?.includes(searchQuery);
    
    // Stock level filter
    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = item.qty < 10;
    else if (stockFilter === 'medium') matchesStock = item.qty >= 10 && item.qty <= 50;
    else if (stockFilter === 'high') matchesStock = item.qty > 50;
    
    return matchesSearch && matchesStock;
  });

  // Calculate stats
  const totalItems = filteredInventory.length;
  const totalQuantity = filteredInventory.reduce((sum, item) => sum + item.qty, 0);
  const totalValue = filteredInventory.reduce((sum, item) => 
    sum + (item.qty * (item.product?.price || 0)), 0
  );
  const lowStockCount = inventory.filter(item => item.qty < 10).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Управление складом</h1>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-2 px-1 border-b-2 ${
                activeTab === 'inventory'
                  ? 'border-[#475B8D] text-[#475B8D]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Остатки товаров
            </button>
            <button
              onClick={() => setActiveTab('warehouses')}
              className={`py-2 px-1 border-b-2 ${
                activeTab === 'warehouses'
                  ? 'border-[#475B8D] text-[#475B8D]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Склады
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`py-2 px-1 border-b-2 ${
                activeTab === 'stores'
                  ? 'border-[#475B8D] text-[#475B8D]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Магазины
            </button>
          </nav>
        </div>

        {activeTab === 'inventory' && (
          <>
            {/* Filters */}
            <div className="card p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Склад
                  </label>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  >
                    {warehouses.length === 0 ? (
                      <option value="">Нет складов</option>
                    ) : (
                      warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Поиск товара
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Название, артикул или штрих-код..."
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фильтр по остатку
                  </label>
                  <select 
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  >
                    <option value="all">Все товары</option>
                    <option value="low">Мало (менее 10)</option>
                    <option value="medium">Средне (10-50)</option>
                    <option value="high">Много (более 50)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card p-4">
                <p className="text-sm text-gray-600 mb-1">Всего позиций</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-600 mb-1">Общее количество</p>
                <p className="text-2xl font-bold">{totalQuantity}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-600 mb-1">Общая стоимость</p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()} сум</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-600 mb-1">Мало на складе</p>
                <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="card">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Остатки на складе</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Товар
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Артикул
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Остаток
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Ед. изм.
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Цена
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Сумма
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Статус
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          Загрузка...
                        </td>
                      </tr>
                    ) : filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          Нет данных
                        </td>
                      </tr>
                    ) : (
                      filteredInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">
                                {item.product?.name || 'Без названия'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.product?.sku || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.qty < 10 
                                ? 'bg-red-100 text-red-700' 
                                : item.qty < 50 
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {item.qty}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.product?.unit || 'шт'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {(item.product?.price || 0).toLocaleString()} сум
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {(item.qty * (item.product?.price || 0)).toLocaleString()} сум
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {item.qty < 10 
                              ? <span className="text-red-600">Критически мало</span>
                              : item.qty < 50 
                              ? <span className="text-yellow-600">Мало</span>
                              : <span className="text-green-600">Достаточно</span>
                            }
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'warehouses' && (
          <div className="card">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Управление складами</h3>
              <button 
                onClick={() => {
                  setWarehouseForm({...warehouseForm, store_id: stores[0]?.id || ''});
                  setShowWarehouseModal(true);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Добавить склад
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">№</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Название</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Код</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Магазин</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Адрес</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {warehouses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Нет складов
                      </td>
                    </tr>
                  ) : (
                    warehouses.map((warehouse, index) => (
                      <tr key={warehouse.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{String(index + 1).padStart(2, '0')}</td>
                        <td className="px-6 py-4 text-sm font-medium">{warehouse.name}</td>
                        <td className="px-6 py-4 text-sm">{warehouse.code}</td>
                        <td className="px-6 py-4 text-sm">
                          {stores.find(s => s.id === warehouse.store_id)?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">{warehouse.address || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            warehouse.is_active 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {warehouse.is_active ? 'Активен' : 'Неактивен'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingWarehouse(warehouse);
                                setWarehouseForm(warehouse);
                                setShowWarehouseModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteWarehouse(warehouse.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="card">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Управление магазинами</h3>
              <button 
                onClick={() => setShowStoreModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Добавить магазин
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">№</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Название</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Код</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Адрес</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Складов</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Нет магазинов
                      </td>
                    </tr>
                  ) : (
                    stores.map((store, index) => (
                      <tr key={store.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{String(index + 1).padStart(2, '0')}</td>
                        <td className="px-6 py-4 text-sm font-medium">{store.name}</td>
                        <td className="px-6 py-4 text-sm">{store.code}</td>
                        <td className="px-6 py-4 text-sm">{store.address || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          {warehouses.filter(w => w.store_id === store.id).length}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            store.is_active 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {store.is_active ? 'Активен' : 'Неактивен'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingStore(store);
                                setStoreForm(store);
                                setShowStoreModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStore(store.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Store Modal */}
        {showStoreModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingStore ? 'Редактировать магазин' : 'Добавить магазин'}
                </h2>
                <button
                  onClick={() => {
                    setShowStoreModal(false);
                    resetStoreForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateStore} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название магазина *
                  </label>
                  <input
                    type="text"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({...storeForm, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Код магазина *
                  </label>
                  <input
                    type="text"
                    value={storeForm.code}
                    onChange={(e) => setStoreForm({...storeForm, code: e.target.value})}
                    placeholder="Например: SHOP001"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес
                  </label>
                  <textarea
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({...storeForm, address: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="store_active"
                    checked={storeForm.is_active}
                    onChange={(e) => setStoreForm({...storeForm, is_active: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="store_active" className="text-sm text-gray-700">
                    Магазин активен
                  </label>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStoreModal(false);
                      resetStoreForm();
                    }}
                    className="btn-secondary"
                  >
                    Отмена
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingStore ? 'Сохранить' : 'Добавить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Warehouse Modal */}
        {showWarehouseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingWarehouse ? 'Редактировать склад' : 'Добавить склад'}
                </h2>
                <button
                  onClick={() => {
                    setShowWarehouseModal(false);
                    resetWarehouseForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateWarehouse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название склада *
                  </label>
                  <input
                    type="text"
                    value={warehouseForm.name}
                    onChange={(e) => setWarehouseForm({...warehouseForm, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Код склада *
                  </label>
                  <input
                    type="text"
                    value={warehouseForm.code}
                    onChange={(e) => setWarehouseForm({...warehouseForm, code: e.target.value})}
                    placeholder="Например: WH001"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Магазин *
                  </label>
                  <select
                    value={warehouseForm.store_id}
                    onChange={(e) => setWarehouseForm({...warehouseForm, store_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    required
                  >
                    <option value="">Выберите магазин</option>
                    {stores.map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес
                  </label>
                  <textarea
                    value={warehouseForm.address}
                    onChange={(e) => setWarehouseForm({...warehouseForm, address: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="warehouse_active"
                    checked={warehouseForm.is_active}
                    onChange={(e) => setWarehouseForm({...warehouseForm, is_active: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="warehouse_active" className="text-sm text-gray-700">
                    Склад активен
                  </label>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWarehouseModal(false);
                      resetWarehouseForm();
                    }}
                    className="btn-secondary"
                  >
                    Отмена
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingWarehouse ? 'Сохранить' : 'Добавить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}