"use client";
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  ArrowUp,
  ArrowDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Calendar,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  productAPI,
  salesAPI,
  inventoryAPI,
  tenantAPI,
} from "@/utils/api";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import toast from "react-hot-toast";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    revenueChange: 0,
    sales: 0,
    salesChange: 0,
    customers: 0,
    customersChange: 0,
    products: 0,
    productsChange: 0,
  });

  const [financialData, setFinancialData] = useState({
    taxes: 0,
    profit: 0,
    expenses: 0,
    total: 0,
  });

  const [recentProducts, setRecentProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [tenantInfo, setTenantInfo] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        salesAPI.list({ limit: 5, order: '-created_at' }),
        productAPI.list(),
        inventoryAPI.getStock({ limit: 100, include: 'product' }),
        tenantAPI.getMe(),
        tenantAPI.getStats(),
      ]);

      const [salesRes, prodRes, inventoryRes, tenantRes, statsRes] = results;

      const salesData = salesRes.status === 'fulfilled' ? salesRes.value.data : [];
      const productsData = prodRes.status === 'fulfilled' ? prodRes.value.data : [];
      const inventoryData = inventoryRes.status === 'fulfilled' ? inventoryRes.value.data : [];
      const tenantData = tenantRes.status === 'fulfilled' ? tenantRes.value.data : null;
      const statsData = statsRes.status === 'fulfilled' ? statsRes.value.data : {};

      // Calculate revenue from actual sales
      const totalRevenue = Array.isArray(salesData) 
        ? salesData.reduce((sum, sale) => sum + (sale.total || 0), 0)
        : 0;

      // Find low stock items
      const lowStock = inventoryData.filter(item => item.qty < 10);

      setStats({
        revenue: totalRevenue,
        revenueChange: 12.5, // Mock change percentage
        sales: Array.isArray(salesData) ? salesData.length : 0,
        salesChange: 8.3, // Mock change percentage
        customers: statsData.total || 0,
        customersChange: 5.2, // Mock change percentage
        products: Array.isArray(productsData) ? productsData.length : 0,
        productsChange: 2.1, // Mock change percentage
      });

      // Mock financial data (since we don't have these endpoints)
      setFinancialData({
        taxes: Math.floor(totalRevenue * 0.12),
        profit: Math.floor(totalRevenue * 0.35),
        expenses: Math.floor(totalRevenue * 0.53),
        total: totalRevenue,
      });

      setRecentSales(Array.isArray(salesData) ? salesData.slice(0, 5) : []);
      setRecentProducts(Array.isArray(productsData) ? productsData.slice(0, 5) : []);
      setLowStockAlerts(lowStock);
      setTenantInfo(tenantData);
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
      toast.error('Не удалось загрузить данные дашборда');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = () => {
    toast.info('Функция промо-акций в разработке');
  };

  const handleAddProduct = () => {
    window.location.href = "/products";
  };

  const donutData = {
    labels: ["Налоги", "Прибыль", "Расходы"],
    datasets: [
      {
        data: [
          financialData.taxes,
          financialData.profit,
          financialData.expenses,
        ],
        backgroundColor: ["#ef4444", "#22c55e", "#eab308"],
        borderWidth: 0,
      },
    ],
  };

  const getStockStatusColor = (stock) => {
    if (stock < 10) return "text-red-500";
    if (stock < 50) return "text-yellow-500";
    return "text-green-500";
  };

  const getStockStatusText = (stock) => {
    if (stock < 10) return "Критически мало";
    if (stock < 50) return "Мало";
    return "Достаточно";
  };

  if (loading && !stats.revenue) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#475B8D]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
          {tenantInfo && (
            <div className="text-sm text-gray-600">
              {tenantInfo.name} - {tenantInfo.is_active ? 'Активен' : 'Неактивен'}
              {tenantInfo.trial_until && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                  Пробный период до {new Date(tenantInfo.trial_until).toLocaleDateString('ru-RU')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleAddProduct}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Добавить товар</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-gray-600">
              Пополните ассортимент — добавьте новый товар.
            </p>
          </div>

          <div
            className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
            // onClick={handleCreatePromotion}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Создать новую акцию</h3>
              {/* <ChevronRight className="h-5 w-5 text-gray-400" /> */}
            </div>
            <p className="text-gray-600">
              Добавьте новую акцию, чтобы привлекать клиентов.
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3">Статус системы</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Продуктов:</span>
                <span className="font-medium">{stats.products}</span>
              </div>
              <div className="flex justify-between">
                <span>Продаж сегодня:</span>
                <span className="font-medium">{stats.sales}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Общий доход</p>
                <p className="text-2xl font-bold">
                  {stats.revenue.toLocaleString()}
                </p>
                <p
                  className={`text-xs flex items-center gap-1 mt-1 ${
                    stats.revenueChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats.revenueChange >= 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(stats.revenueChange)}% от прошлого месяца
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Продажи</p>
                <p className="text-2xl font-bold">
                  {stats.sales.toLocaleString()}
                </p>
                <p
                  className={`text-xs flex items-center gap-1 mt-1 ${
                    stats.salesChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats.salesChange >= 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(stats.salesChange)}% от прошлого месяца
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Клиенты</p>
                <p className="text-2xl font-bold">
                  {stats.customers.toLocaleString()}
                </p>
                <p
                  className={`text-xs flex items-center gap-1 mt-1 ${
                    stats.customersChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stats.customersChange >= 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(stats.customersChange)}% от прошлого месяца
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Товары</p>
                <p className="text-2xl font-bold">
                  {stats.products.toLocaleString()}
                </p>
                <p
                  className={`text-xs flex items-center gap-1 mt-1 ${
                    stats.productsChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stats.productsChange >= 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(stats.productsChange)}% от прошлого месяца
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          {lowStockAlerts.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  ⚠️ Предупреждения о запасах
                </h3>
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Товар</th>
                      <th className="text-left py-2">Остаток</th>
                      <th className="text-left py-2">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockAlerts.slice(0, 5).map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">
                          {item.product?.name || 'Товар'}
                        </td>
                        <td className="py-2">{item.qty}</td>
                        <td
                          className={`py-2 ${getStockStatusColor(item.qty)}`}
                        >
                          {getStockStatusText(item.qty)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Sales */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Последние продажи</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">№ чека</th>
                    <th className="text-left py-2">Сумма</th>
                    <th className="text-left py-2">Дата</th>
                    <th className="text-left py-2">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.length > 0 ? (
                    recentSales.map((sale, index) => (
                      <tr key={sale.id} className="border-b">
                        <td className="py-2">
                          #{index + 1}
                        </td>
                        <td className="py-2">
                          {sale.total?.toLocaleString()} сум
                        </td>
                        <td className="py-2">
                          {new Date(sale.created_at).toLocaleDateString(
                            "ru-RU"
                          )}
                        </td>
                        <td className="py-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            Завершено
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-4 text-gray-500"
                      >
                        Нет данных о продажах
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Financial Chart */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Финансовая статистика</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">
                  {financialData.taxes.toLocaleString()} Налоги
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">
                  {financialData.profit.toLocaleString()} Прибыль
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">
                  {financialData.expenses.toLocaleString()} Расходы
                </span>
              </div>
            </div>
          </div>

          {financialData.total > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <div className="w-64 h-64">
                  <Doughnut
                    data={donutData}
                    options={{
                      maintainAspectRatio: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              return (
                                context.label +
                                ": " +
                                context.parsed.toLocaleString() +
                                " сум"
                              );
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-2xl font-bold">
                  Общий доход {financialData.total.toLocaleString()} сум
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Нет данных для отображения
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}