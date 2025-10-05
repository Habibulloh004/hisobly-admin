"use client";
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Edit2, Trash2, UserPlus, Clock, Shield } from 'lucide-react';

export default function Staff() {
  const [activeTab, setActiveTab] = useState('employees');
  
  const employees = [
    { id: 1, name: 'Азамат Шакиров', gender: 'МЖ', serial: '0246AHR', phone: '+99899-999-99-99', role: 'Админ', access: 'Без' },
    { id: 2, name: 'Азамат Шакиров', gender: 'МЖ', serial: '0251ITO', phone: '+99899-999-99-99', role: 'IT', access: 'Без' },
    { id: 3, name: 'Азамат Шакиров', gender: 'МЖ', serial: '0340ITO', phone: '+99899-999-99-99', role: 'IT', access: 'Без' },
    { id: 4, name: 'Азамат Шакиров', gender: 'МЖ', serial: '0146APM', phone: '+99899-999-99-99', role: 'Админ', access: 'Без' },
    { id: 5, name: 'Азамат Шакиров', gender: 'МЖ', serial: '0226ACS', phone: '+99899-999-99-99', role: 'Админ', access: 'Без' },
  ];

  const roles = [
    { id: 1, name: 'Кассир', hours: 'от 1 до 2' },
    { id: 2, name: 'Кассир', hours: 'от 1 до 2' },
    { id: 3, name: 'Официант', hours: 'от 1 до 2' },
    { id: 4, name: 'Официант', hours: 'от 1 до 2' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Управление сотрудниками</h1>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Создать учётную запись</h3>
              <UserPlus className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Создание учётных записей сотрудников.</p>
          </div>

          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Учёт рабочего времени</h3>
              <Clock className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Учёт рабочего времени.</p>
          </div>

          <div className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Назначение ролей</h3>
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Назначение ролей и прав (кассир, администратор).</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('employees')}
              className={`py-2 px-1 border-b-2 ${
                activeTab === 'employees'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Все сотрудники
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-2 px-1 border-b-2 ${
                activeTab === 'roles'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Сотрудники
            </button>
          </nav>
        </div>

        {/* Content based on tab */}
        {activeTab === 'employees' ? (
          <div className="card">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Все сотрудники</h3>
                <button className="btn-primary flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Добавить сотрудника
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">№</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Имя</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Фамилия</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Пол</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Серия</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Номер телефона</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Роль</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Права</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{String(employee.id).padStart(2, '0')}</td>
                      <td className="px-6 py-4 text-sm">Азамат</td>
                      <td className="px-6 py-4 text-sm">Шакиров</td>
                      <td className="px-6 py-4 text-sm">{employee.gender}</td>
                      <td className="px-6 py-4 text-sm">{employee.serial}</td>
                      <td className="px-6 py-4 text-sm">{employee.phone}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{employee.access}</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Больше</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t flex justify-center gap-1">
              <button className="px-3 py-1 bg-indigo-600 text-white rounded">1</button>
              <button className="px-3 py-1 hover:bg-gray-100 rounded">2</button>
              <button className="px-3 py-1 hover:bg-gray-100 rounded">3</button>
              <button className="px-3 py-1 hover:bg-gray-100 rounded">4</button>
              <button className="px-3 py-1 hover:bg-gray-100 rounded">5</button>
              <button className="px-3 py-1 hover:bg-gray-100 rounded">&gt;&gt;</button>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Сотрудники</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">№</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Сотрудник</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Роль</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Рабочее время</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{String(role.id).padStart(2, '0')}</td>
                      <td className="px-6 py-4 text-sm">Азамат Азаматов</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {role.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{role.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
