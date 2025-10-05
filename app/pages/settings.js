"use client";
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Settings, Globe, Shield, Database, Bell, Users } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'Общие настройки', icon: Settings },
    { id: 'localization', name: 'Локализация', icon: Globe },
    { id: 'security', name: 'Безопасность', icon: Shield },
    { id: 'backup', name: 'Резервное копирование', icon: Database },
    { id: 'notifications', name: 'Уведомления', icon: Bell },
    { id: 'equipment', name: 'Оборудование', icon: Settings },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Настройки системы</h1>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex flex-wrap gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card p-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Общие настройки</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название компании
                  </label>
                  <input
                    type="text"
                    defaultValue="Hisobly"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ИНН
                  </label>
                  <input
                    type="text"
                    placeholder="Введите ИНН"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес
                  </label>
                  <input
                    type="text"
                    placeholder="Введите адрес"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    placeholder="+998"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary">Сохранить изменения</button>
              </div>
            </div>
          )}

          {activeTab === 'localization' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Локализация</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Язык системы
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Русский</option>
                    <option>Узбекский</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Валюта
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Узбекский Сум</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Часовой пояс
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>UTC+5 (Ташкент)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Формат даты
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary">Сохранить изменения</button>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Резервное копирование</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Автоматическое резервное копирование</h4>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Включено</span>
                    </label>
                    <select className="px-3 py-1 border rounded text-sm">
                      <option>Ежедневно</option>
                      <option>Еженедельно</option>
                      <option>Ежемесячно</option>
                    </select>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Последнее резервное копирование</h4>
                  <p className="text-sm text-gray-600">25 января 2025, 03:00</p>
                  <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-700">
                    Скачать резервную копию
                  </button>
                </div>
                <button className="btn-primary">
                  Создать резервную копию сейчас
                </button>
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Оборудование</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">№</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Название</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Тип</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Язык</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Валюта</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Версия</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">01</td>
                      <td className="px-6 py-4 text-sm">Epson E956</td>
                      <td className="px-6 py-4 text-sm">Принтер</td>
                      <td className="px-6 py-4 text-sm">Русский</td>
                      <td className="px-6 py-4 text-sm">Узбекский Сум</td>
                      <td className="px-6 py-4 text-sm">165A53</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">Изменить</button>
                          <button className="text-red-600 hover:text-red-800 text-sm">Удалить</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button className="btn-primary">Добавить оборудование</button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
