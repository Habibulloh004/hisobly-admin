"use client";
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Eye, Download, Calendar, TrendingUp, DollarSign, ShoppingCart, Package, X, Trash2, Edit2 } from 'lucide-react';
import { salesAPI, storeAPI, warehouseAPI, productAPI, discountAPI } from '@/utils/api';
import toast from 'react-hot-toast';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [filters, setFilters] = useState({
    store_id: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  // New sale form data
  const [saleForm, setSaleForm] = useState({
    store_id: '',
    warehouse_id: '',
    discount_id: '',
    items: [],
    payments: [],
    note: ''
  });

  // Product search for adding items
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemForm, setItemForm] = useState({
    product_id: '',
    qty: 1,
    price: 0,
    discount: 0,
    tax_rate: 0
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    type: 'cash',
    amount: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [filters]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [storesRes, warehousesRes, productsRes, discountsRes] = await Promise.all([
        storeAPI.list(),
        warehouseAPI.list(),
        productAPI.list(),
        discountAPI.list()
      ]);
      
      setStores(storesRes.data || []);
      setWarehouses(warehousesRes.data || []);
      setProducts(productsRes.data || []);
      setDiscounts(discountsRes.data || []);
      
      // Set default store and warehouse if available
      if (storesRes.data && storesRes.data.length > 0) {
        setSaleForm(prev => ({ ...prev, store_id: storesRes.data[0].id }));
      }
      if (warehousesRes.data && warehousesRes.data.length > 0) {
        setSaleForm(prev => ({ ...prev, warehouse_id: warehousesRes.data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const params = {};
      if (filters.store_id) params.store_id = filters.store_id;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      
      const { data } = await salesAPI.list(params);
      setSales(data || []);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error('Выберите товар');
      return;
    }
    
    if (itemForm.qty <= 0) {
      toast.error('Количество должно быть больше 0');
      return;
    }
    
    const newItem = {
      ...itemForm,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      price: itemForm.price || selectedProduct.price
    };
    
    setSaleForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    // Reset item form
    setSelectedProduct(null);
    setProductSearch('');
    setItemForm({
      product_id: '',
      qty: 1,
      price: 0,
      discount: 0,
      tax_rate: 0
    });
  };

  const handleRemoveItem = (index) => {
    setSaleForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleAddPayment = () => {
    if (paymentForm.amount <= 0) {
      toast.error('Сумма платежа должна быть больше 0');
      return;
    }
    
    setSaleForm(prev => ({
      ...prev,
      payments: [...prev.payments, { ...paymentForm }]
    }));
    
    setPaymentForm({
      type: 'cash',
      amount: 0
    });
  };

  const handleRemovePayment = (index) => {
    setSaleForm(prev => ({
      ...prev,
      payments: prev.payments.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const subtotal = saleForm.items.reduce((sum, item) => {
      return sum + (item.price * item.qty);
    }, 0);
    
    const discountTotal = saleForm.items.reduce((sum, item) => {
      return sum + (item.discount * item.qty);
    }, 0);
    
    const taxTotal = saleForm.items.reduce((sum, item) => {
      const itemTotal = (item.price - item.discount) * item.qty;
      return sum + (itemTotal * item.tax_rate / 100);
    }, 0);
    
    const total = subtotal - discountTotal + taxTotal;
    const paid = saleForm.payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return { subtotal, discountTotal, taxTotal, total, paid };
  };

  const handleCreateSale = async () => {
    if (!saleForm.store_id) {
      toast.error('Выберите магазин');
      return;
    }
    
    if (saleForm.items.length === 0) {
      toast.error('Добавьте товары в чек');
      return;
    }
    
    const totals = calculateTotals();
    
    // Auto-add payment if no payments added
    let finalPayments = saleForm.payments;
    if (finalPayments.length === 0) {
      finalPayments = [{
        type: 'cash',
        amount: totals.total
      }];
    }
    
    setLoading(true);
    try {
      const saleData = {
        store_id: saleForm.store_id,
        warehouse_id: saleForm.warehouse_id || null,
        discount_id: saleForm.discount_id || null,
        items: saleForm.items.map(item => ({
          product_id: item.product_id,
          qty: parseFloat(item.qty),
          price: parseFloat(item.price),
          discount: parseFloat(item.discount) || 0,
          tax_rate: parseFloat(item.tax_rate) || 0
        })),
        payments: finalPayments.map(payment => ({
          type: payment.type,
          amount: parseFloat(payment.amount)
        })),
        note: saleForm.note || null
      };
      
      await salesAPI.create(saleData);
      toast.success('Продажа создана успешно');
      setShowCreateModal(false);
      resetSaleForm();
      fetchSales();
    } catch (error) {
      console.error('Failed to create sale:', error);
      toast.error('Ошибка при создании продажи');
    } finally {
      setLoading(false);
    }
  };

  const resetSaleForm = () => {
    setSaleForm({
      store_id: stores.length > 0 ? stores[0].id : '',
      warehouse_id: warehouses.length > 0 ? warehouses[0].id : '',
      discount_id: '',
      items: [],
      payments: [],
      note: ''
    });
    setSelectedProduct(null);
    setProductSearch('');
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.barcode?.includes(productSearch)
  );

  const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const averageSale = sales.length > 0 ? totalSales / sales.length : 0;
  const todaySales = sales.filter(s => {
    const today = new Date().toDateString();
    return new Date(s.created_at).toDateString() === today;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Управление продажами</h1>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
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
                <p className="text-2xl font-bold">{todaySales.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Выручка сегодня</p>
                <p className="text-2xl font-bold">
                  {todaySales.reduce((sum, s) => sum + s.total, 0).toLocaleString()} сум
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Средний чек</p>
                <p className="text-2xl font-bold">{Math.floor(averageSale).toLocaleString()} сум</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего продаж</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
              <Package className="h-8 w-8 text-yellow-500" />
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
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Нет продаж
                    </td>
                  </tr>
                ) : (
                  sales.map((sale, index) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">
                        #{String(index + 1).padStart(6, '0')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(sale.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {stores.find(s => s.id === sale.store_id)?.name || 'Магазин'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {(sale.subtotal || 0).toLocaleString()} сум
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600">
                        -{(sale.discount_total || 0).toLocaleString()} сум
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {(sale.total || 0).toLocaleString()} сум
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Sale Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Новая продажа</h2>
                <button 
                  onClick={() => {
                    setShowCreateModal(false);
                    resetSaleForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Store and Warehouse Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Магазин *
                    </label>
                    <select
                      value={saleForm.store_id}
                      onChange={(e) => setSaleForm({...saleForm, store_id: e.target.value})}
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
                      Склад
                    </label>
                    <select
                      value={saleForm.warehouse_id}
                      onChange={(e) => setSaleForm({...saleForm, warehouse_id: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    >
                      <option value="">Выберите склад</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Скидка
                    </label>
                    <select
                      value={saleForm.discount_id}
                      onChange={(e) => setSaleForm({...saleForm, discount_id: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                    >
                      <option value="">Без скидки</option>
                      {discounts.filter(d => d.active).map(discount => (
                        <option key={discount.id} value={discount.id}>
                          {discount.name} ({discount.percent ? `${discount.percent}%` : `${discount.amount_fixed} сум`})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Add Products */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Товары</h3>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Поиск товара..."
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                        />
                        {productSearch && (
                          <div className="absolute bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto z-10">
                            {filteredProducts.slice(0, 5).map(product => (
                              <div
                                key={product.id}
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setItemForm({...itemForm, price: product.price});
                                  setProductSearch(product.name);
                                }}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-600">
                                  {product.price.toLocaleString()} сум
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <input
                          type="number"
                          value={itemForm.qty}
                          onChange={(e) => setItemForm({...itemForm, qty: e.target.value})}
                          placeholder="Кол-во"
                          min="0.01"
                          step="0.01"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                        />
                      </div>
                      
                      <div>
                        <input
                          type="number"
                          value={itemForm.price}
                          onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                          placeholder="Цена"
                          min="0"
                          step="1"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                        />
                      </div>
                      
                      <div>
                        <button
                          onClick={handleAddItem}
                          className="w-full btn-primary"
                        >
                          Добавить
                        </button>
                      </div>
                    </div>

                    {/* Items List */}
                    {saleForm.items.length > 0 && (
                      <div className="mt-4">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Товар</th>
                              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Кол-во</th>
                              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Цена</th>
                              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Сумма</th>
                              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {saleForm.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 text-sm">{item.product_name}</td>
                                <td className="px-3 py-2 text-sm">{item.qty}</td>
                                <td className="px-3 py-2 text-sm">{item.price.toLocaleString()} сум</td>
                                <td className="px-3 py-2 text-sm font-medium">
                                  {(item.price * item.qty).toLocaleString()} сум
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payments */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Оплата</h3>
                  <div className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <select
                          value={paymentForm.type}
                          onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                        >
                          <option value="cash">Наличные</option>
                          <option value="card">Карта</option>
                          <option value="Click">Click</option>
                          <option value="Payme">Payme</option>
                          <option value="Uzumbank">Uzumbank</option>
                          <option value="Bonus">Бонус</option>
                          <option value="Certificate">Сертификат</option>
                          <option value="Others">Другое</option>
                        </select>
                      </div>
                      
                      <div>
                        <input
                          type="number"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                          placeholder="Сумма"
                          min="0"
                          step="1"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                        />
                      </div>
                      
                      <div>
                        <button
                          onClick={handleAddPayment}
                          className="w-full btn-secondary"
                        >
                          Добавить платеж
                        </button>
                      </div>
                    </div>

                    {saleForm.payments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {saleForm.payments.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                            <span className="text-sm">{payment.type}: {payment.amount.toLocaleString()} сум</span>
                            <button
                              onClick={() => handleRemovePayment(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Примечание
                  </label>
                  <textarea
                    value={saleForm.note}
                    onChange={(e) => setSaleForm({...saleForm, note: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>

                {/* Totals */}
                {saleForm.items.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {(() => {
                        const totals = calculateTotals();
                        return (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Подытог:</span>
                              <span>{totals.subtotal.toLocaleString()} сум</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-600">
                              <span>Скидка:</span>
                              <span>-{totals.discountTotal.toLocaleString()} сум</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Налог:</span>
                              <span>{totals.taxTotal.toLocaleString()} сум</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                              <span>Итого:</span>
                              <span>{totals.total.toLocaleString()} сум</span>
                            </div>
                            {saleForm.payments.length > 0 && (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span>Оплачено:</span>
                                  <span>{totals.paid.toLocaleString()} сум</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Сдача:</span>
                                  <span>{Math.max(0, totals.paid - totals.total).toLocaleString()} сум</span>
                                </div>
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetSaleForm();
                    }}
                    className="btn-secondary"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleCreateSale}
                    disabled={loading || saleForm.items.length === 0}
                    className="btn-primary"
                  >
                    {loading ? 'Создание...' : 'Создать продажу'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}