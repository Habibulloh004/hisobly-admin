"use client";
import Layout from '@/components/Layout';
import { BarChart3, TrendingUp, DollarSign, FileText } from 'lucide-react';
import { Bar } from 'react-chartjs-2';

export default function Analytics() {
  const monthlyData = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    datasets: [
      {
        label: 'Продажи',
        data: [300, 450, 320, 500, 430, 380, 420, 510, 480, 450, 520, 580],
        backgroundColor: '#6366f1',
      },
      {
        label: 'Налоги',
        data: [30, 45, 32, 50, 43, 38, 42, 51, 48, 45, 52, 58],
        backgroundColor: '#fbbf24',
      },
      {
        label: 'Прибыль',
        data: [270, 405, 288, 450, 387, 342, 378, 459, 432, 405, 468, 522],
        backgroundColor: '#10b981',
      },
    ],
  };

  const reports = [
    { id: 1, name: 'Название', type: 'Прибыль', date: '10/01/2025', amounts: [600000, 1145331, 224000, 224000], actions: ['Изменить', 'Удалить'] },
    { id: 2, name: 'Название', type: 'Прибыль', date: '10/01/2025', amounts: [197500, 1145331, 224000, 224000], actions: ['Изменить', 'Удалить'] },
    { id: 3, name: 'Название', type: 'Прибыль', date: '10/01/2025', amounts: [600000, 1145331, 224000, 224000], actions: ['Изменить', 'Удалить'] },
    { id: 4, name: 'Название', type: 'Прибыль', date: '10/01/2025', amounts: [600000, 1145331, 224000, 224000], actions: ['Изменить', 'Удалить'] },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Отчеты и аналитика</h1>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Финансовые отчёты</h3>
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Финансовые отчёты (выручка, налоги, прибыль).</p>
          </div>

          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Анализ</h3>
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Анализ продаж по товарам, категориям, сотрудникам.</p>
          </div>

          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Отчеты</h3>
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Отчеты по программам лояльности.</p>
          </div>
        </div>

        {/* Chart */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Анализ</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <span className="text-sm">Продажи</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-sm">Налоги</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Прибыль</span>
              </div>
            </div>
          </div>
          <Bar 
            data={monthlyData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return value + 'к';
                    }
                  }
                }
              }
            }}
          />
        </div>

        {/* Reports Table */}
        <div className="card">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Финансовые отчёты</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">№</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Название</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Тип</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase" colSpan="4">Суммы</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{String(report.id).padStart(2, '0')}</td>
                    <td className="px-6 py-4 text-sm">{report.name}</td>
                    <td className="px-6 py-4 text-sm">{report.type}</td>
                    <td className="px-6 py-4 text-sm">{report.date}</td>
                    {report.amounts.map((amount, idx) => (
                      <td key={idx} className="px-6 py-4 text-sm">{amount.toLocaleString()}.00</td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Изменить</button>
                        <button className="text-red-600 hover:text-red-800 text-sm">Удалить</button>
                      </div>
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
