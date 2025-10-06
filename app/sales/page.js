"use client";
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Eye, Download, Calendar, TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';
import { salesAPI, storeAPI } from '@/utils/api';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({
    store_id: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  useEffect(() => {
    fetchStores();
    fetchSales();
  }, []);

  const fetchStores = async () => {
    try {
      const { data } = await storeAPI.list();
      setStores(data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const fetchSales = async () => {
    try {
      const params = {};
      if (filters.store_id) params.store_id = filters.store_id;
      const { data } = await salesAPI.list(params);
      setSales(data);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    }
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const averageSale = sales.length > 0 ? totalSales / sales.length : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Управление продажами</h1>
          <div className="flex gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <Download className="h-5 w-5" />
              Экспорт
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Новая продажа
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Продажи сегодня</p>
                <p className="text-2xl font-bold">{sales.filter(s => {
                  const today = new Date().toDateString();
                  return new Date(s.created_at).toDateString() === today;
                }).length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Выручка сегодня</p>
                <p className="text-2xl font-bold">{totalSales.toLocaleString()} сум</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Средний чек</p>
                <p className="text-2xl font-bold">{averageSale.toLocaleString()} сум</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Возвраты</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Package className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Магазин
              </label>
              <select
                value={filters.store_id}
                onChange={(e) => setFilters({...filters, store_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
              >
                <option value="">Все магазины</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата от
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата до
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поиск
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  placeholder="Номер чека..."
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    № Чека
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Дата
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Магазин
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Сумма
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Скидка
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Итого
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Оплата
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales.map((sale, index) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(sale.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {stores.find(s => s.id === sale.store_id)?.name || 'Магазин'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {sale.subtotal.toLocaleString()} сум
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600">
                      -{sale.discount_total.toLocaleString()} сум
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {sale.total.toLocaleString()} сум
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        Оплачено
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-[#475B8D] hover:text-[#475B8D]">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
