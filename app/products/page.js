"use client";
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Edit2, Trash2, Package, Filter, X } from 'lucide-react';
import { productAPI, categoryAPI } from '@/utils/api';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterActive, setFilterActive] = useState('all'); // all, active, inactive

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    price: '',
    cost: '',
    unit: 'шт',
    category_id: '',
    is_active: true,
    ikpu_code: '',
    unit_code: '',
    comment: ''
  });

  const units = [
    { value: 'pcs', label: 'шт' },
    { value: 'kg', label: 'кг' },
    { value: 'g', label: 'г' },
    { value: 'l', label: 'л' },
    { value: 'ml', label: 'мл' },
    { value: 'm', label: 'м' },
    { value: 'm2', label: 'м²' },
    { value: 'm3', label: 'м³' },
    { value: 'box', label: 'коробка' },
    { value: 'pack', label: 'упаковка' }
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await productAPI.list();
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await categoryAPI.list();
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Введите название и цену товара');
      return;
    }
    
    try {
      const data = {
        name: formData.name,
        price: formData.price,
        sku: formData.sku,
        barcode: formData.barcode,
        cost: formData.cost || 0,
        unit: formData.unit || 'pcs',
        category_id: formData.category_id,
        is_active: formData.is_active,
        ikpu_code: formData.ikpu_code,
        unit_code: formData.unit_code,
        comment: formData.comment
      };

      if (editingProduct) {
        await productAPI.update(editingProduct.id, data);
        toast.success('Товар обновлен');
      } else {
        await productAPI.create(data);
        toast.success('Товар добавлен');
      }

      fetchProducts();
      setShowAddModal(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        errors.forEach(err => toast.error(err));
      } else {
        toast.error('Ошибка при сохранении товара');
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Удалить этот товар?')) {
      try {
        await productAPI.delete(id);
        toast.success('Товар удален');
        fetchProducts();
      } catch (error) {
        toast.error('Ошибка при удалении товара');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      price: '',
      cost: '',
      unit: 'шт',
      category_id: '',
      is_active: true,
      ikpu_code: '',
      unit_code: '',
      comment: ''
    });
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product => {
    // Filter by search query
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by active status
    const matchesActive = 
      filterActive === 'all' ? true :
      filterActive === 'active' ? product.is_active :
      filterActive === 'inactive' ? !product.is_active :
      true;
    
    return matchesSearch && matchesActive;
  });

  const activeCount = products.filter(p => p.is_active).length;
  const inactiveCount = products.filter(p => !p.is_active).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" /> Добавить товар
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-sm text-gray-600">Всего товаров</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Активных</p>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Неактивных</p>
            <p className="text-2xl font-bold text-gray-400">{inactiveCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Категорий</p>
            <p className="text-2xl font-bold">{categories.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию, артикулу или штрих-коду..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-3 py-2 rounded-lg ${
                  filterActive === 'all' ? 'bg-[#475B8D] text-white' : 'bg-gray-100'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-3 py-2 rounded-lg ${
                  filterActive === 'active' ? 'bg-[#475B8D] text-white' : 'bg-gray-100'
                }`}
              >
                Активные
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-3 py-2 rounded-lg ${
                  filterActive === 'inactive' ? 'bg-[#475B8D] text-white' : 'bg-gray-100'
                }`}
              >
                Неактивные
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Товар</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Артикул</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Штрих-код</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Категория</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Цена</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Себестоимость</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ед. изм.</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">Загрузка...</td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">Нет товаров</td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.sku || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.barcode || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {product.category_id 
                          ? categories.find(c => c.id === product.category_id)?.name || '-'
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{product.price.toLocaleString()} сум</td>
                      <td className="px-6 py-4 text-sm">{(product.cost || 0).toLocaleString()} сум</td>
                      <td className="px-6 py-4 text-sm">{product.unit || 'шт'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.is_active ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setFormData({
                                name: product.name,
                                sku: product.sku || '',
                                barcode: product.barcode || '',
                                price: product.price,
                                cost: product.cost || '',
                                unit: product.unit || 'шт',
                                category_id: product.category_id || '',
                                is_active: product.is_active,
                                ikpu_code: product.ikpu_code || '',
                                unit_code: product.unit_code || '',
                                comment: product.comment || ''
                              });
                              setShowAddModal(true);
                            }}
                            className="text-[#475B8D] hover:text-[#475B8D]"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800">
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

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название товара *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Артикул (SKU)
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Штрих-код
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Цена *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Себестоимость
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Единица измерения
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    >
                      {units.map(unit => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Категория
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    >
                      <option value="">Без категории</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Код ИКПУ
                    </label>
                    <input
                      type="text"
                      value={formData.ikpu_code}
                      onChange={(e) => setFormData({ ...formData, ikpu_code: e.target.value })}
                      placeholder="Для фискальных операций"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Код единицы измерения
                    </label>
                    <input
                      type="text"
                      value={formData.unit_code}
                      onChange={(e) => setFormData({ ...formData, unit_code: e.target.value })}
                      placeholder="Для отчетности"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Комментарий
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Товар активен
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
                    {editingProduct ? 'Сохранить' : 'Добавить'}
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