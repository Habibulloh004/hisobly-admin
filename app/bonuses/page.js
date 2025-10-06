"use client";
import Layout from '@/components/Layout';
import { Plus, Gift, TrendingUp, Users } from 'lucide-react';

export default function Bonuses() {
  const bonuses = [
    { id: 1, name: 'Акция', type: 'Бонус', date: '10/01/2025', amounts: [600000, 1145331], actions: ['Изменить', 'Удалить'] },
    { id: 2, name: 'Акция', type: 'Скидка', date: '10/01/2025', amounts: [197500, 1145331], actions: ['Изменить', 'Удалить'] },
    { id: 3, name: 'Акция', type: 'Лояльность', date: '10/01/2025', amounts: [600000, 1145331], actions: ['Изменить', 'Удалить'] },
    { id: 4, name: 'Акция', type: 'Скидка', date: '10/01/2025', amounts: [600000, 1145331], actions: ['Изменить', 'Удалить'] },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Программы лояльности</h1>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" /> Создать программу
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Настройка</h3>
              <Gift className="h-5 w-5 text-[#475B8D]" />
            </div>
            <p className="text-gray-600">Настройка бонусных программ.</p>
          </div>

          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Акции</h3>
              <TrendingUp className="h-5 w-5 text-[#475B8D]" />
            </div>
            <p className="text-gray-600">Создание и управление акциями.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные программы</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <Gift className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Участники программ</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Выдано бонусов</p>
                <p className="text-2xl font-bold">45,678</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Бонусы</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">№</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Название</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Тип</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Сумма</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Сумма</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bonuses.map((bonus) => (
                  <tr key={bonus.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{String(bonus.id).padStart(2, '0')}</td>
                    <td className="px-6 py-4 text-sm">{bonus.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          bonus.type === 'Бонус'
                            ? 'bg-green-100 text-green-700'
                            : bonus.type === 'Скидка'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {bonus.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{bonus.date}</td>
                    <td className="px-6 py-4 text-sm">{bonus.amounts[0].toLocaleString()}.00</td>
                    <td className="px-6 py-4 text-sm">{bonus.amounts[1].toLocaleString()}.00</td>
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
          <div className="p-4 border-t flex justify-center gap-1">
            <button className="px-3 py-1 bg-[#475B8D] text-white rounded">1</button>
            <button className="px-3 py-1 hover:bg-gray-100 rounded">2</button>
            <button className="px-3 py-1 hover:bg-gray-100 rounded">3</button>
            <button className="px-3 py-1 hover:bg-gray-100 rounded">4</button>
            <button className="px-3 py-1 hover:bg-gray-100 rounded">5</button>
            <button className="px-3 py-1 hover:bg-gray-100 rounded">&gt;&gt;</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

