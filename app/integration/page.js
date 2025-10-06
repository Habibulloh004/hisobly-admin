"use client";
import Layout from '@/components/Layout';
import { Plug, Zap, Database } from 'lucide-react';

export default function Integration() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Интеграции</h1>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Подключение</h3>
              <Plug className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Подключение к CRM, бухгалтерским системам (1C, QuickBooks).</p>
          </div>

          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Интеграция</h3>
              <Zap className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Интеграция с фискальными регистраторами и платежными терминалами.</p>
          </div>
        </div>

        {/* Available Integrations */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Доступные интеграции</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: '1C Бухгалтерия', status: 'Не подключено', icon: Database },
              { name: 'QuickBooks', status: 'Не подключено', icon: Database },
              { name: 'Payme', status: 'Активно', icon: Zap },
              { name: 'Click', status: 'Активно', icon: Zap },
              { name: 'Uzumbank', status: 'Не подключено', icon: Zap },
              { name: 'Фискальный регистратор', status: 'Активно', icon: Plug },
            ].map((integration, index) => (
              <div key={index} className="border rounded-lg p-4 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <integration.icon className="h-5 w-5 text-gray-400" />
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    integration.status === 'Активно' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {integration.status}
                  </span>
                </div>
                <h4 className="font-medium">{integration.name}</h4>
                <button className={`mt-2 text-sm ${
                  integration.status === 'Активно'
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-indigo-600 hover:text-indigo-700'
                }`}>
                  {integration.status === 'Активно' ? 'Отключить' : 'Подключить'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
