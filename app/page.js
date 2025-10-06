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
  customerAPI,
  analyticsAPI,
  inventoryAPI,
  promotionAPI,
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
  const [activePromotions, setActivePromotions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        analyticsAPI.getDashboard({ period: 'today' }),
        salesAPI.list({ limit: 5, sort: '-created_at' }),
        productAPI.list({ limit: 5, sort: '-created_at' }),
        customerAPI.list({ limit: 5, sort: '-created_at' }),
        inventoryAPI.getLowStock({ limit: 5 }),
        promotionAPI.list({ status: 'active', limit: 3 }),
        analyticsAPI.getFinancialReport({ period: 'today' }),
      ]);

      const [dashRes, salesRes, prodRes, custRes, lowStockRes, promoRes, finRes] = results;

      const dashboardData = dashRes.status === 'fulfilled' ? dashRes.value.data : {};
      const salesData = salesRes.status === 'fulfilled' ? salesRes.value.data : [];
      const productsData = prodRes.status === 'fulfilled' ? prodRes.value.data : [];
      const customersData = custRes.status === 'fulfilled' ? custRes.value.data : [];
      const lowStockData = lowStockRes.status === 'fulfilled' ? lowStockRes.value.data : [];
      const promotionsData = promoRes.status === 'fulfilled' ? promoRes.value.data : [];
      const financialReport = finRes.status === 'fulfilled' ? finRes.value.data : {};

      setStats({
        revenue: dashboardData.revenue || 0,
        revenueChange: dashboardData.revenueChange || 0,
        sales: dashboardData.salesCount || (Array.isArray(salesData) ? salesData.length : 0),
        salesChange: dashboardData.salesChange || 0,
        customers: dashboardData.customersCount || (Array.isArray(customersData) ? customersData.length : 0),
        customersChange: dashboardData.customersChange || 0,
        products: dashboardData.productsCount || (Array.isArray(productsData) ? productsData.length : 0),
        productsChange: dashboardData.productsChange || 0,
      });

      setFinancialData({
        taxes: financialReport.taxes || 0,
        profit: financialReport.profit || 0,
        expenses: financialReport.expenses || 0,
        total: financialReport.total || 0,
      });

      setRecentSales(Array.isArray(salesData) ? salesData : []);
      setRecentProducts(Array.isArray(productsData) ? productsData : []);
      setLowStockAlerts(Array.isArray(lowStockData) ? lowStockData : []);
      setActivePromotions(Array.isArray(promotionsData) ? promotionsData : []);
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
      toast.error('Не удалось загрузить данные дашборда');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = () => {
    // Navigate to promotion creation page
    window.location.href = "/promotions/new";
  };

  const handleAddProduct = () => {
    // Navigate to product creation page
    window.location.href = "/products/new";
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

  const monthlyChartData = {
    labels: [
      "Янв",
      "Фев",
      "Мар",
      "Апр",
      "Май",
      "Июн",
      "Июл",
      "Авг",
      "Сен",
      "Окт",
      "Ноя",
      "Дек",
    ],
    datasets: [
      {
        label: "Продажи",
        data: stats.monthlyRevenue || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#6366f1",
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
          <button
            className="btn-primary"
            onClick={() => {
              analyticsAPI
                .exportReport("dashboard", { format: "pdf" })
                .then((response) => {
                  const url = window.URL.createObjectURL(
                    new Blob([response.data])
                  );
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", "dashboard-report.pdf");
                  document.body.appendChild(link);
                  link.click();
                })
                .catch((error) =>
                  toast.error("Не удалось экспортировать отчет")
                );
            }}
          >
            Экспорт отчета
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            onClick={handleCreatePromotion}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Создать новую акцию</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-gray-600">
              Добавьте новую акцию, чтобы привлекать клиентов и увеличивать
              продажи.
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3">Активные акции</h3>
            {activePromotions.length > 0 ? (
              <div className="space-y-2">
                {activePromotions.map((promo, index) => (
                  <div key={promo.id || index} className="text-sm">
                    <span className="font-medium">{promo.name}</span>
                    <span className="text-gray-500 ml-2">
                      {promo.discount_type === "percentage"
                        ? `${promo.discount_value}%`
                        : `${promo.discount_value.toLocaleString()} сум`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Нет активных акций</p>
            )}
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
                    {lowStockAlerts.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">
                          {item.product?.name || item.name}
                        </td>
                        <td className="py-2">{item.quantity || item.qty}</td>
                        <td
                          className={`py-2 ${getStockStatusColor(
                            item.quantity || item.qty
                          )}`}
                        >
                          {getStockStatusText(item.quantity || item.qty)}
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
                          #{sale.receipt_number || index + 1}
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
                            {sale.status || "Завершено"}
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
