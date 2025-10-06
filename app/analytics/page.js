"use client";
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  BarChart3, TrendingUp, DollarSign, FileText, Download, Calendar,
  Filter, RefreshCw, PieChart, Activity, Users, Package
} from 'lucide-react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { analyticsAPI } from '@/utils/api';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('financial');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    to: new Date().toISOString().split('T')[0], // Today
    period: 'month'
  });

  const [financialData, setFinancialData] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    taxes: 0,
    netProfit: 0,
    monthlyData: [],
    dailyData: []
  });

  const [salesData, setSalesData] = useState({
    totalSales: 0,
    averageCheck: 0,
    topProducts: [],
    topCategories: [],
    hourlyDistribution: [],
    paymentMethods: []
  });

  const [productData, setProductData] = useState({
    totalProducts: 0,
    activeProducts: 0,
    topSelling: [],
    lowStock: [],
    categoryDistribution: [],
    turnoverRate: []
  });

  const [customerData, setCustomerData] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    returningRate: 0,
    topCustomers: [],
    segmentation: [],
    loyaltyMetrics: []
  });

  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, activeTab]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const params = {
        from: dateRange.from,
        to: dateRange.to,
        period: dateRange.period
      };

      switch(activeTab) {
        case 'financial':
          await fetchFinancialData(params);
          break;
        case 'sales':
          await fetchSalesData(params);
          break;
        case 'products':
          await fetchProductData(params);
          break;
        case 'customers':
          await fetchCustomerData(params);
          break;
        default:
          break;
      }

      // Fetch reports list
      await fetchReports();
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast.error('Не удалось загрузить аналитические данные');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialData = async (params) => {
    const [financial, tax, profit] = await Promise.all([
      analyticsAPI.getFinancialReport(params),
      analyticsAPI.getTaxReport(params),
      analyticsAPI.getProfitReport(params)
    ]);

    setFinancialData({
      revenue: financial.data.revenue || 0,
      expenses: financial.data.expenses || 0,
      profit: profit.data.grossProfit || 0,
      taxes: tax.data.totalTax || 0,
      netProfit: profit.data.netProfit || 0,
      monthlyData: financial.data.monthlyBreakdown || [],
      dailyData: financial.data.dailyBreakdown || []
    });
  };

  const fetchSalesData = async (params) => {
    const sales = await analyticsAPI.getSalesReport(params);
    
    setSalesData({
      totalSales: sales.data.totalSales || 0,
      averageCheck: sales.data.averageCheck || 0,
      topProducts: sales.data.topProducts || [],
      topCategories: sales.data.topCategories || [],
      hourlyDistribution: sales.data.hourlyDistribution || [],
      paymentMethods: sales.data.paymentMethods || []
    });
  };

  const fetchProductData = async (params) => {
    const products = await analyticsAPI.getProductReport(params);
    
    setProductData({
      totalProducts: products.data.totalProducts || 0,
      activeProducts: products.data.activeProducts || 0,
      topSelling: products.data.topSelling || [],
      lowStock: products.data.lowStock || [],
      categoryDistribution: products.data.categoryDistribution || [],
      turnoverRate: products.data.turnoverRate || []
    });
  };

  const fetchCustomerData = async (params) => {
    const customers = await analyticsAPI.getCustomerReport(params);
    
    setCustomerData({
      totalCustomers: customers.data.totalCustomers || 0,
      newCustomers: customers.data.newCustomers || 0,
      returningRate: customers.data.returningRate || 0,
      topCustomers: customers.data.topCustomers || [],
      segmentation: customers.data.segmentation || [],
      loyaltyMetrics: customers.data.loyaltyMetrics || []
    });
  };

  const fetchReports = async () => {
    // This would fetch saved reports
    setReports([
      { id: 1, name: 'Месячный отчет', type: 'Финансовый', date: new Date().toLocaleDateString('ru-RU'), status: 'Готов' },
      { id: 2, name: 'Налоговый отчет', type: 'Налоги', date: new Date().toLocaleDateString('ru-RU'), status: 'Готов' },
      { id: 3, name: 'Отчет по продажам', type: 'Продажи', date: new Date().toLocaleDateString('ru-RU'), status: 'В процессе' },
      { id: 4, name: 'Анализ прибыли', type: 'Прибыль', date: new Date().toLocaleDateString('ru-RU'), status: 'Готов' },
    ]);
  };

  const handleExport = async (type) => {
    try {
      const response = await analyticsAPI.exportReport(type, {
        from: dateRange.from,
        to: dateRange.to,
        format: 'xlsx'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report-${dateRange.from}-${dateRange.to}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Отчет успешно экспортирован');
    } catch (error) {
      toast.error('Ошибка при экспорте отчета');
    }
  };

  const handleQuickDateRange = (period) => {
    const today = new Date();
    let from = new Date();
    
    switch(period) {
      case 'today':
        from = today;
        break;
      case 'week':
        from.setDate(today.getDate() - 7);
        break;
      case 'month':
        from.setDate(1);
        break;
      case 'quarter':
        from.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        from = new Date(today.getFullYear(), 0, 1);
        break;
    }
    
    setDateRange({
      from: from.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
      period
    });
  };

  // Chart configurations
  const monthlyChartData = {
    labels: financialData.monthlyData.map(d => d.month) || ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    datasets: [
      {
        label: 'Выручка',
        data: financialData.monthlyData.map(d => d.revenue) || [],
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
        borderWidth: 2,
      },
      {
        label: 'Расходы',
        data: financialData.monthlyData.map(d => d.expenses) || [],
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        borderWidth: 2,
      },
      {
        label: 'Прибыль',
        data: financialData.monthlyData.map(d => d.profit) || [],
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 2,
      }
    ]
  };

  const salesByCategory = {
    labels: salesData.topCategories.map(c => c.name) || [],
    datasets: [{
      data: salesData.topCategories.map(c => c.total) || [],
      backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'],
      borderWidth: 0,
    }]
  };

  const paymentMethodsChart = {
    labels: salesData.paymentMethods.map(p => p.method) || ['Наличные', 'Карта', 'Перевод'],
    datasets: [{
      data: salesData.paymentMethods.map(p => p.amount) || [],
      backgroundColor: ['#10b981', '#6366f1', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  const productCategoryChart = {
    labels: productData.categoryDistribution.map(c => c.category) || [],
    datasets: [{
      label: 'Количество товаров',
      data: productData.categoryDistribution.map(c => c.count) || [],
      backgroundColor: '#8b5cf6',
    }]
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Отчеты и аналитика</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => fetchAnalyticsData()}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Обновить
            </button>
            <button 
              onClick={() => handleExport(activeTab)}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              Экспорт
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className={`card p-6 hover:shadow-md transition-shadow cursor-pointer ${
              activeTab === 'financial' ? 'border-2 border-indigo-500' : ''
            }`}
            onClick={() => setActiveTab('financial')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Финансовые отчёты</h3>
              <DollarSign className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Финансовые отчёты (выручка, налоги, прибыль).</p>
          </div>

          <div 
            className={`card p-6 hover:shadow-md transition-shadow cursor-pointer ${
              activeTab === 'sales' ? 'border-2 border-indigo-500' : ''
            }`}
            onClick={() => setActiveTab('sales')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Анализ продаж</h3>
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Анализ продаж по товарам, категориям, сотрудникам.</p>
          </div>

          <div 
            className={`card p-6 hover:shadow-md transition-shadow cursor-pointer ${
              activeTab === 'products' ? 'border-2 border-indigo-500' : ''
            }`}
            onClick={() => setActiveTab('products')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Товарная аналитика</h3>
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Анализ товарооборота и остатков.</p>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickDateRange('today')}
                className={`px-3 py-1 rounded ${dateRange.period === 'today' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
              >
                Сегодня
              </button>
              <button
                onClick={() => handleQuickDateRange('week')}
                className={`px-3 py-1 rounded ${dateRange.period === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
              >
                Неделя
              </button>
              <button
                onClick={() => handleQuickDateRange('month')}
                className={`px-3 py-1 rounded ${dateRange.period === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
              >
                Месяц
              </button>
              <button
                onClick={() => handleQuickDateRange('quarter')}
                className={`px-3 py-1 rounded ${dateRange.period === 'quarter' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
              >
                Квартал
              </button>
              <button
                onClick={() => handleQuickDateRange('year')}
                className={`px-3 py-1 rounded ${dateRange.period === 'year' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
              >
                Год
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="px-3 py-1 border rounded"
              />
              <span>—</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="px-3 py-1 border rounded"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            {activeTab === 'financial' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Выручка</p>
                    <p className="text-2xl font-bold text-green-600">
                      {financialData.revenue.toLocaleString()} сум
                    </p>
                  </div>
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Расходы</p>
                    <p className="text-2xl font-bold text-red-600">
                      {financialData.expenses.toLocaleString()} сум
                    </p>
                  </div>
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Валовая прибыль</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {financialData.profit.toLocaleString()} сум
                    </p>
                  </div>
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Налоги</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {financialData.taxes.toLocaleString()} сум
                    </p>
                  </div>
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Чистая прибыль</p>
                    <p className="text-2xl font-bold text-green-600">
                      {financialData.netProfit.toLocaleString()} сум
                    </p>
                  </div>
                </div>

                {/* Financial Chart */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Финансовая динамика</h3>
                  <Bar
                    data={monthlyChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return value.toLocaleString() + ' сум';
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </>
            )}

            {activeTab === 'sales' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Общие продажи</p>
                    <p className="text-2xl font-bold">{salesData.totalSales.toLocaleString()} сум</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Средний чек</p>
                    <p className="text-2xl font-bold">{salesData.averageCheck.toLocaleString()} сум</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Кол-во продаж</p>
                    <p className="text-2xl font-bold">
                      {salesData.totalSales && salesData.averageCheck 
                        ? Math.round(salesData.totalSales / salesData.averageCheck).toLocaleString()
                        : 0}
                    </p>
                  </div>
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Топ категория</p>
                    <p className="text-lg font-bold">
                      {salesData.topCategories[0]?.name || 'Нет данных'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sales by Category */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4">Продажи по категориям</h3>
                    {salesData.topCategories.length > 0 ? (
                      <Pie data={salesByCategory} options={{ plugins: { legend: { position: 'right' } } }} />
                    ) : (
                      <p className="text-gray-500 text-center">Нет данных</p>
                    )}
                  </div>

                  {/* Payment Methods */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4">Способы оплаты</h3>
                    {salesData.paymentMethods.length > 0 ? (
                      <Doughnut data={paymentMethodsChart} options={{ plugins: { legend: { position: 'right' } } }} />
                    ) : (
                      <p className="text-gray-500 text-center">Нет данных</p>
                    )}
                  </div>
                </div>

                {/* Top Products */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Топ товаров</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">№</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Товар</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Продано</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Выручка</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">% от общей</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {salesData.topProducts.length > 0 ? (
                          salesData.topProducts.slice(0, 10).map((product, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm">{index + 1}</td>
                              <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                              <td className="px-6 py-4 text-sm">{product.quantity}</td>
                              <td className="px-6 py-4 text-sm">{product.total.toLocaleString()} сум</td>
                              <td className="px-6 py-4 text-sm">
                                {((product.total / salesData.totalSales) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center py-4 text-gray-500">Нет данных</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'products' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Всего товаров</p>
                    <p className="text-2xl font-bold">{productData.totalProducts}</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Активных</p>
                    <p className="text-2xl font-bold text-green-600">{productData.activeProducts}</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Мало на складе</p>
                    <p className="text-2xl font-bold text-yellow-600">{productData.lowStock.length}</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-sm text-gray-600">Категорий</p>
                    <p className="text-2xl font-bold">{productData.categoryDistribution.length}</p>
                  </div>
                </div>

                {/* Product Category Distribution */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Распределение по категориям</h3>
                  {productData.categoryDistribution.length > 0 ? (
                    <Bar
                      data={productCategoryChart}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } }
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 text-center">Нет данных</p>
                  )}
                </div>
              </>
            )}

            {/* Reports Table */}
            <div className="card">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Сохраненные отчёты</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">№</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Название</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Тип</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Дата создания</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{String(report.id).padStart(2, '0')}</td>
                        <td className="px-6 py-4 text-sm font-medium">{report.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                            {report.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{report.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.status === 'Готов' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm">Открыть</button>
                            <button className="text-indigo-600 hover:text-indigo-800 text-sm">Скачать</button>
                            <button className="text-red-600 hover:text-red-800 text-sm">Удалить</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}