import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  ArrowUp, 
  ArrowDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { productAPI, salesAPI } from '@/utils/api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: [],
    sales: [],
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, salesRes] = await Promise.all([
        productAPI.list(),
        salesAPI.list({ limit: 10 })
      ]);
      
      setStats({
        products: productsRes.data.slice(0, 5),
        sales: salesRes.data,
        totalRevenue: salesRes.data.reduce((sum, sale) => sum + sale.total, 0),
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const donutData = {
    labels: ['Налоги', 'Прибыль', 'Расходы'],
    datasets: [{
      data: [80, 370, 50],
      backgroundColor: ['#ef4444', '#22c55e', '#eab308'],
      borderWidth: 0,
    }],
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
          <button className="btn-primary">
            Экспорт отчета
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Добавить товар</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-gray-600">Пополните ассортимент — добавьте новый товар.</p>
          </div>

          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Создать новую акцию</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-gray-600">Добавьте новую акцию, чтобы привлекать клиентов и увеличивать продажи.</p>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3">Баннер для рекламы</h3>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 rounded-lg"></div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Общий доход</p>
                <p className="text-2xl font-bold">500 000</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  12% от прошлого месяца
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
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  8% от прошлого месяца
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
                <p className="text-2xl font-bold">456</p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <ArrowDown className="h-3 w-3" />
                  3% от прошлого месяца
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
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  5% от прошлого месяца
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products Table */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Статистика товаров</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">№</th>
                    <th className="text-left py-2">Товар</th>
                    <th className="text-left py-2">Остаток</th>
                    <th className="text-left py-2">Срок</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, name: 'Coca Cola', stock: 'Много', status: 'Истёк', color: 'text-red-500' },
                    { id: 2, name: 'Pepsi', stock: 'Мало', status: 'Близок', color: 'text-yellow-500' },
                    { id: 3, name: 'Snickers', stock: 'Много', status: 'Свежий', color: 'text-green-500' },
                    { id: 4, name: 'Twix', stock: 'Мало', status: 'Свежий', color: 'text-green-500' },
                  ].map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.id}</td>
                      <td className="py-2">{item.name}</td>
                      <td className="py-2">{item.stock}</td>
                      <td className={`py-2 ${item.color}`}>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales Table */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Статистика продаж</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">№ чека</th>
                    <th className="text-left py-2">Тип отчёта</th>
                    <th className="text-left py-2">Оплачено</th>
                    <th className="text-left py-2">Дата</th>
                    <th className="text-left py-2">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, type: 'Выручка', amount: '5 000 сум', date: '25/01/2025', status: 'Процессе', statusColor: 'text-yellow-500' },
                    { id: 2, type: 'Налоги', amount: '-', date: '19/01/2025', status: 'Закрыт', statusColor: 'text-green-500' },
                    { id: 3, type: 'Прибыль', amount: '-', date: '10/01/2025', status: 'Закрыт', statusColor: 'text-green-500' },
                    { id: 4, type: 'Зарплаты', amount: '-', date: '03/01/2025', status: 'Процессе', statusColor: 'text-yellow-500' },
                  ].map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">0{item.id}</td>
                      <td className="py-2">{item.type}</td>
                      <td className="py-2">{item.amount}</td>
                      <td className="py-2">{item.date}</td>
                      <td className={`py-2 ${item.statusColor}`}>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Финансовая графа</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">80 Налоги</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">370 Прибыль</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">50 Расходы</span>
              </div>
            </div>
          </div>
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
                          return context.label + ': ' + context.parsed;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-2xl font-bold">Общий доход 500 000</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
