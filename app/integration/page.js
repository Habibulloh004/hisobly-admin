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
              <div key={index} className="border rounded-lg p-4 hover:border-[#475B8D] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <integration.icon className="h-5 w-5 text-gray-400" />
                  
                </div>
                <h4 className="font-medium">{integration.name}</h4>
                <button className={`mt-2 text-sm ${
                  integration.status === 'Активно'
                    && 'text-[#475B8D] hover:text-[#475B8D]'
                }`}>
                  {integration.status === 'Активно' ? 'Скоро...' : 'Скоро...'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
