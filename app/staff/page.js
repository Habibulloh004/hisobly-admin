"use client";
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Edit2, Trash2, UserPlus, Clock, Shield, Eye, EyeOff, Calendar, DollarSign, Users } from 'lucide-react';
import { employeeAPI, roleAPI } from '@/utils/api';
import toast from 'react-hot-toast';

export default function Staff() {
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role_id: '',
    gender: 'male',
    birth_date: '',
    address: '',
    serial_number: '',
    salary_type: 'monthly',
    salary_amount: '',
    hire_date: new Date().toISOString().split('T')[0],
    is_active: true,
  });

  const [scheduleData, setScheduleData] = useState({
    monday: { start: '09:00', end: '18:00', is_working: true },
    tuesday: { start: '09:00', end: '18:00', is_working: true },
    wednesday: { start: '09:00', end: '18:00', is_working: true },
    thursday: { start: '09:00', end: '18:00', is_working: true },
    friday: { start: '09:00', end: '18:00', is_working: true },
    saturday: { start: '09:00', end: '14:00', is_working: true },
    sunday: { start: '', end: '', is_working: false },
  });

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onDutyNow: 0,
    totalSalaryExpense: 0,
  });

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
    fetchStats();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await employeeAPI.list({
        include: 'role,schedule',
        limit: 100
      });
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Не удалось загрузить список сотрудников');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await roleAPI.list();
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch employee statistics
      const employees = await employeeAPI.list({ limit: 1000 });
      const activeCount = employees.data.filter(e => e.is_active).length;
      const totalSalary = employees.data.reduce((sum, e) => sum + (e.salary_amount || 0), 0);
      
      setStats({
        totalEmployees: employees.data.length,
        activeEmployees: activeCount,
        onDutyNow: Math.floor(activeCount * 0.3), // This should come from actual schedule check
        totalSalaryExpense: totalSalary,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        salary_amount: parseFloat(formData.salary_amount) || 0,
      };

      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.id, data);
        toast.success('Данные сотрудника обновлены');
      } else {
        await employeeAPI.create(data);
        toast.success('Сотрудник добавлен');
      }

      fetchEmployees();
      fetchStats();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error('Ошибка при сохранении данных сотрудника');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      try {
        await employeeAPI.delete(id);
        toast.success('Сотрудник удален');
        fetchEmployees();
        fetchStats();
      } catch (error) {
        toast.error('Ошибка при удалении сотрудника');
      }
    }
  };

  const handleScheduleSubmit = async () => {
    if (!selectedEmployee) return;
    
    try {
      await employeeAPI.setSchedule(selectedEmployee.id, scheduleData);
      toast.success('График работы обновлен');
      setShowScheduleModal(false);
      fetchEmployees();
    } catch (error) {
      toast.error('Ошибка при сохранении графика работы');
    }
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      role_id: '',
      gender: 'male',
      birth_date: '',
      address: '',
      serial_number: '',
      salary_type: 'monthly',
      salary_amount: '',
      hire_date: new Date().toISOString().split('T')[0],
      is_active: true,
    });
  };

  const filteredEmployees = employees.filter(employee =>
    employee.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.phone?.includes(searchQuery)
  );

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Не назначено';
  };

  const getRoleColor = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    const roleName = role?.name?.toLowerCase() || '';
    
    if (roleName.includes('админ') || roleName.includes('директор')) return 'bg-red-100 text-red-700';
    if (roleName.includes('менеджер')) return 'bg-blue-100 text-blue-700';
    if (roleName.includes('кассир')) return 'bg-green-100 text-green-700';
    if (roleName.includes('склад')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Управление сотрудниками</h1>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowAddModal(true)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Создать учётную запись</h3>
              <UserPlus className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Создание учётных записей сотрудников.</p>
          </div>

          <div 
            className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab('schedule')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Учёт рабочего времени</h3>
              <Clock className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Учёт рабочего времени.</p>
          </div>

          <div 
            className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab('roles')}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Назначение ролей</h3>
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-gray-600">Назначение ролей и прав (кассир, администратор).</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего сотрудников</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активных</p>
                <p className="text-2xl font-bold">{stats.activeEmployees}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">На смене сейчас</p>
                <p className="text-2xl font-bold">{stats.onDutyNow}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Фонд зарплаты</p>
                <p className="text-2xl font-bold">{stats.totalSalaryExpense.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
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
              Роли и права
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2 px-1 border-b-2 ${
                activeTab === 'schedule'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              График работы
            </button>
          </nav>
        </div>

        {/* Content based on tab */}
        {activeTab === 'employees' && (
          <div className="card">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div className="flex gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск по имени, email или телефону..."
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
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
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ФИО</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Телефон</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Роль</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Зарплата</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        Загрузка...
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        Нет сотрудников
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee, index) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{String(index + 1).padStart(2, '0')}</td>
                        <td className="px-6 py-4 text-sm font-medium">{employee.full_name}</td>
                        <td className="px-6 py-4 text-sm">{employee.email}</td>
                        <td className="px-6 py-4 text-sm">{employee.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs ${getRoleColor(employee.role_id)}`}>
                            {getRoleName(employee.role_id)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {employee.salary_amount?.toLocaleString()} сум
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            employee.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {employee.is_active ? 'Активен' : 'Неактивен'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingEmployee(employee);
                                setFormData({
                                  ...employee,
                                  password: '', // Don't populate password
                                });
                                setShowAddModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setShowScheduleModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(employee.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="card">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Роли и права доступа</h3>
                <button className="btn-primary">Создать роль</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Роль</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Описание</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Сотрудников</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Права</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{role.name}</td>
                      <td className="px-6 py-4 text-sm">{role.description}</td>
                      <td className="px-6 py-4 text-sm">
                        {employees.filter(e => e.role_id === role.id).length}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {role.permissions?.length || 0} разрешений
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Настроить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Employee Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingEmployee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ФИО *
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+998901234567"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingEmployee ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                        required={!editingEmployee}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Роль *
                    </label>
                    <select
                      value={formData.role_id}
                      onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Выберите роль</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Пол
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="male">Мужской</option>
                      <option value="female">Женский</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата рождения
                    </label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Серия паспорта
                    </label>
                    <input
                      type="text"
                      value={formData.serial_number}
                      onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                      placeholder="AB1234567"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тип зарплаты
                    </label>
                    <select
                      value={formData.salary_type}
                      onChange={(e) => setFormData({...formData, salary_type: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="monthly">Месячная</option>
                      <option value="hourly">Почасовая</option>
                      <option value="daily">Дневная</option>
                      <option value="commission">Комиссия</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Размер зарплаты
                    </label>
                    <input
                      type="number"
                      value={formData.salary_amount}
                      onChange={(e) => setFormData({...formData, salary_amount: e.target.value})}
                      placeholder="0"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата найма
                    </label>
                    <input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Сотрудник активен
                  </label>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="btn-secondary"
                  >
                    Отмена
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingEmployee ? 'Сохранить' : 'Добавить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}