"use client";
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Gift, TrendingUp, Users, Edit2, Trash2, Percent, DollarSign, Calendar } from 'lucide-react';
import { discountAPI } from '@/utils/api';
import toast from 'react-hot-toast';

export default function Bonuses() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    percent: '',
    amount: '',
    amount_fixed: '',
    active: true,
    valid_from: '',
    valid_to: ''
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const { data } = await discountAPI.list();
      setDiscounts(data || []);
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
      toast.error('Не удалось загрузить скидки');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Введите название скидки');
      return;
    }
    
    // At least one discount type should be filled
    if (!formData.percent && !formData.amount && !formData.amount_fixed) {
      toast.error('Укажите хотя бы один тип скидки');
      return;
    }
    
    try {
      if (editingDiscount) {
        await discountAPI.update(editingDiscount.id, formData);
        toast.success('Скидка обновлена');
      } else {
        await discountAPI.create(formData);
        toast.success('Скидка создана');
      }
      
      fetchDiscounts();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error('Ошибка при сохранении скидки');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Удалить эту скидку?')) {
      try {
        await discountAPI.delete(id);
        toast.success('Скидка удалена');
        fetchDiscounts();
      } catch (error) {
        toast.error('Ошибка при удалении скидки');
      }
    }
  };

  const resetForm = () => {
    setEditingDiscount(null);
    setFormData({
      name: '',
      percent: '',
      amount: '',
      amount_fixed: '',
      active: true,
      valid_from: '',
      valid_to: ''
    });
  };

  const getDiscountType = (discount) => {
    if (discount.percent) return 'Процент';
    if (discount.amount_fixed) return 'Фиксированная';
    if (discount.amount) return 'Сумма';
    return 'Другое';
  };

  const getDiscountValue = (discount) => {
    if (discount.percent) return `${discount.percent}%`;
    if (discount.amount_fixed) return `${discount.amount_fixed.toLocaleString()} сум`;
    if (discount.amount) return `${discount.amount.toLocaleString()} сум`;
    return '-';
  };

  const getDiscountColor = (type) => {
    switch (type) {
      case 'Процент': return 'bg-green-100 text-green-700';
      case 'Фиксированная': return 'bg-blue-100 text-blue-700';
      case 'Сумма': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const activeDiscounts = discounts.filter(d => d.active).length;
  const expiredDiscounts = discounts.filter(d => {
    if (!d.valid_to) return false;
    return new Date(d.valid_to) < new Date();
  }).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Скидки и акции</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Создать скидку
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Настройка скидок</h3>
              <Gift className="h-5 w-5 text-[#475B8D]" />
            </div>
            <p className="text-gray-600">Настройка процентных и фиксированных скидок.</p>
          </div>

          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Акции</h3>
              <TrendingUp className="h-5 w-5 text-[#475B8D]" />
            </div>
            <p className="text-gray-600">Создание временных акций и специальных предложений.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего скидок</p>
                <p className="text-2xl font-bold">{discounts.length}</p>
              </div>
              <Gift className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные</p>
                <p className="text-2xl font-bold">{activeDiscounts}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Истекшие</p>
                <p className="text-2xl font-bold">{expiredDiscounts}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Процентные</p>
                <p className="text-2xl font-bold">
                  {discounts.filter(d => d.percent).length}
                </p>
              </div>
              <Percent className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Скидки и акции</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">№</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Название</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Тип</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Значение</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действует с</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действует до</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Загрузка...
                    </td>
                  </tr>
                ) : discounts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Нет скидок
                    </td>
                  </tr>
                ) : (
                  discounts.map((discount, index) => {
                    const type = getDiscountType(discount);
                    const isExpired = discount.valid_to && new Date(discount.valid_to) < new Date();
                    
                    return (
                      <tr key={discount.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{String(index + 1).padStart(2, '0')}</td>
                        <td className="px-6 py-4 text-sm font-medium">{discount.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${getDiscountColor(type)}`}>
                            {type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {getDiscountValue(discount)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {discount.valid_from 
                            ? new Date(discount.valid_from).toLocaleDateString('ru-RU')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {discount.valid_to 
                            ? new Date(discount.valid_to).toLocaleDateString('ru-RU')
                            : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isExpired 
                              ? 'bg-red-100 text-red-700'
                              : discount.active 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isExpired ? 'Истекла' : discount.active ? 'Активна' : 'Неактивна'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingDiscount(discount);
                                setFormData({
                                  name: discount.name,
                                  percent: discount.percent || '',
                                  amount: discount.amount || '',
                                  amount_fixed: discount.amount_fixed || '',
                                  active: discount.active,
                                  valid_from: discount.valid_from || '',
                                  valid_to: discount.valid_to || ''
                                });
                                setShowAddModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(discount.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">
                {editingDiscount ? 'Редактировать скидку' : 'Создать скидку'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Тип скидки (заполните одно):</p>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Процент скидки
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.percent}
                        onChange={(e) => setFormData({...formData, percent: e.target.value})}
                        className="w-full px-3 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Фиксированная сумма
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.amount_fixed}
                        onChange={(e) => setFormData({...formData, amount_fixed: e.target.value})}
                        className="w-full px-3 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                        min="0"
                        step="1"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">сум</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Сумма скидки
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="w-full px-3 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                        min="0"
                        step="1"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">сум</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Действует с
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Действует до
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.valid_to}
                      onChange={(e) => setFormData({...formData, valid_to: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700">
                    Скидка активна
                  </label>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="btn-secondary"
                  >
                    Отмена
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingDiscount ? 'Сохранить' : 'Создать'}
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