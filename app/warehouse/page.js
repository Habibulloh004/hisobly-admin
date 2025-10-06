"use client";
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { inventoryAPI, warehouseAPI, productAPI } from '@/utils/api';
import toast from 'react-hot-toast';

export default function Warehouse() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchInventory();
    }
  }, [selectedWarehouse]);

  const fetchWarehouses = async () => {
    try {
      const { data } = await warehouseAPI.list();
      setWarehouses(data);
      if (data.length > 0) {
        setSelectedWarehouse(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryAPI.getStock({
        warehouse_id: selectedWarehouse,
        include: 'warehouse,product',
        limit: 100
      });
      setInventory(data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product?.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Управление складом</h1>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Добавить поступление
          </button>
        </div>

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
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
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
                  placeholder="Название или артикул..."
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фильтр по остатку
              </label>
              <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]">
                <option value="">Все товары</option>
                <option value="low">Мало (менее 10)</option>
                <option value="medium">Средне (10-50)</option>
                <option value="high">Много (более 50)</option>
              </select>
            </div>
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
                    Категория
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
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Загрузка...
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Нет данных
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          {item.product?.name || 'Без названия'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.product?.sku || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.product?.category_id || 'Без категории'}
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
                        {item.product?.price?.toLocaleString()} сум
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {(item.qty * (item.product?.price || 0)).toLocaleString()} сум
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-[#475B8D] hover:text-[#475B8D]">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-sm text-gray-600 mb-1">Всего позиций</p>
            <p className="text-2xl font-bold">{filteredInventory.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 mb-1">Общее количество</p>
            <p className="text-2xl font-bold">
              {filteredInventory.reduce((sum, item) => sum + item.qty, 0)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600 mb-1">Общая стоимость</p>
            <p className="text-2xl font-bold">
              {filteredInventory.reduce((sum, item) => 
                sum + (item.qty * (item.product?.price || 0)), 0
              ).toLocaleString()} сум
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
