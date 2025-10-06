"use client";
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Settings, Globe, Shield, Database, Bell, Users, Save, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { settingsAPI, tenantAPI, storeAPI } from '@/utils/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [stores, setStores] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  
  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    company_name: '',
    inn: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });

  // Localization settings
  const [localizationSettings, setLocalizationSettings] = useState({
    language: 'ru',
    currency: 'UZS',
    timezone: 'UTC+5',
    date_format: 'DD/MM/YYYY',
    number_format: '1,234.56'
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    password_min_length: 8,
    require_two_factor: false,
    session_timeout: 30,
    max_login_attempts: 5,
    password_expiry_days: 90
  });

  // Backup settings
  const [backupSettings, setBackupSettings] = useState({
    backup_enabled: true,
    backup_frequency: 'daily',
    backup_time: '03:00',
    backup_retention_days: 30,
    last_backup: null
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    low_stock_alert: true,
    low_stock_threshold: 10,
    daily_report: true,
    weekly_report: false,
    monthly_report: true
  });

  // Equipment form
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    type: 'Принтер',
    language: 'Русский',
    currency: 'Узбекский Сум',
    version: '',
    port: 'USB',
    status: 'active'
  });

  const tabs = [
    { id: 'general', name: 'Общие настройки', icon: Settings },
    { id: 'localization', name: 'Локализация', icon: Globe },
    { id: 'security', name: 'Безопасность', icon: Shield },
    { id: 'backup', name: 'Резервное копирование', icon: Database },
    { id: 'notifications', name: 'Уведомления', icon: Bell },
    { id: 'equipment', name: 'Оборудование', icon: Settings },
  ];

  useEffect(() => {
    loadSettings();
    fetchTenantInfo();
    fetchStores();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data } = await settingsAPI.getGeneral();
      
      // Load all settings from localStorage or API
      const savedGeneral = localStorage.getItem('settings_general');
      const savedLocalization = localStorage.getItem('settings_localization');
      const savedSecurity = localStorage.getItem('settings_security');
      const savedBackup = localStorage.getItem('settings_backup');
      const savedNotifications = localStorage.getItem('settings_notifications');
      const savedEquipment = localStorage.getItem('settings_equipment');
      
      if (savedGeneral) setGeneralSettings(JSON.parse(savedGeneral));
      if (savedLocalization) setLocalizationSettings(JSON.parse(savedLocalization));
      if (savedSecurity) setSecuritySettings(JSON.parse(savedSecurity));
      if (savedBackup) setBackupSettings(JSON.parse(savedBackup));
      if (savedNotifications) setNotificationSettings(JSON.parse(savedNotifications));
      if (savedEquipment) setEquipment(JSON.parse(savedEquipment));
      
      // If we have data from API, merge it
      if (data.company_name) {
        setGeneralSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantInfo = async () => {
    try {
      const { data } = await tenantAPI.getMe();
      setTenantInfo(data);
      // Update general settings with tenant info
      setGeneralSettings(prev => ({
        ...prev,
        company_name: data.name || prev.company_name
      }));
    } catch (error) {
      console.error('Failed to fetch tenant info:', error);
    }
  };

  const fetchStores = async () => {
    try {
      const { data } = await storeAPI.list();
      setStores(data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const saveGeneralSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('settings_general', JSON.stringify(generalSettings));
      await settingsAPI.updateGeneral(generalSettings);
      toast.success('Общие настройки сохранены');
    } catch (error) {
      toast.error('Ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  const saveLocalizationSettings = () => {
    localStorage.setItem('settings_localization', JSON.stringify(localizationSettings));
    toast.success('Настройки локализации сохранены');
    // Apply language change if needed
    if (localizationSettings.language !== 'ru') {
      toast.info('Смена языка будет применена после перезагрузки');
    }
  };

  const saveSecuritySettings = () => {
    localStorage.setItem('settings_security', JSON.stringify(securitySettings));
    toast.success('Настройки безопасности сохранены');
  };

  const saveBackupSettings = () => {
    localStorage.setItem('settings_backup', JSON.stringify(backupSettings));
    toast.success('Настройки резервного копирования сохранены');
  };

  const saveNotificationSettings = () => {
    localStorage.setItem('settings_notifications', JSON.stringify(notificationSettings));
    toast.success('Настройки уведомлений сохранены');
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      const now = new Date().toISOString();
      setBackupSettings(prev => ({ ...prev, last_backup: now }));
      localStorage.setItem('settings_backup', JSON.stringify({
        ...backupSettings,
        last_backup: now
      }));
      toast.success('Резервная копия создана успешно');
    } catch (error) {
      toast.error('Ошибка при создании резервной копии');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = () => {
    // Create a backup file with all settings and data
    const backup = {
      timestamp: new Date().toISOString(),
      settings: {
        general: generalSettings,
        localization: localizationSettings,
        security: securitySettings,
        backup: backupSettings,
        notifications: notificationSettings,
        equipment: equipment
      }
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Резервная копия скачана');
  };

  const saveEquipment = () => {
    if (!equipmentForm.name) {
      toast.error('Введите название оборудования');
      return;
    }
    
    let updatedEquipment;
    if (editingEquipment) {
      updatedEquipment = equipment.map(eq =>
        eq.id === editingEquipment.id
          ? { ...equipmentForm, id: editingEquipment.id }
          : eq
      );
      toast.success('Оборудование обновлено');
    } else {
      const newEquipment = {
        ...equipmentForm,
        id: Date.now().toString()
      };
      updatedEquipment = [...equipment, newEquipment];
      toast.success('Оборудование добавлено');
    }
    
    setEquipment(updatedEquipment);
    localStorage.setItem('settings_equipment', JSON.stringify(updatedEquipment));
    setShowEquipmentModal(false);
    resetEquipmentForm();
  };

  const deleteEquipment = (id) => {
    if (confirm('Удалить это оборудование?')) {
      const updatedEquipment = equipment.filter(eq => eq.id !== id);
      setEquipment(updatedEquipment);
      localStorage.setItem('settings_equipment', JSON.stringify(updatedEquipment));
      toast.success('Оборудование удалено');
    }
  };

  const resetEquipmentForm = () => {
    setEditingEquipment(null);
    setEquipmentForm({
      name: '',
      type: 'Принтер',
      language: 'Русский',
      currency: 'Узбекский Сум',
      version: '',
      port: 'USB',
      status: 'active'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Настройки системы</h1>
          {tenantInfo && (
            <div className="text-sm text-gray-600">
              План: <span className="font-medium">{tenantInfo.plan}</span>
              {tenantInfo.trial_until && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                  Пробный до {new Date(tenantInfo.trial_until).toLocaleDateString('ru-RU')}
                </span>
              )}
            </div>
          )}
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
                    ? 'border-[#475B8D] text-[#475B8D]'
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
                    value={generalSettings.company_name}
                    onChange={(e) => setGeneralSettings({...generalSettings, company_name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ИНН
                  </label>
                  <input
                    type="text"
                    value={generalSettings.inn}
                    onChange={(e) => setGeneralSettings({...generalSettings, inn: e.target.value})}
                    placeholder="Введите ИНН"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес
                  </label>
                  <input
                    type="text"
                    value={generalSettings.address}
                    onChange={(e) => setGeneralSettings({...generalSettings, address: e.target.value})}
                    placeholder="Введите адрес"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={generalSettings.phone}
                    onChange={(e) => setGeneralSettings({...generalSettings, phone: e.target.value})}
                    placeholder="+998"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.email}
                    onChange={(e) => setGeneralSettings({...generalSettings, email: e.target.value})}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Веб-сайт
                  </label>
                  <input
                    type="url"
                    value={generalSettings.website}
                    onChange={(e) => setGeneralSettings({...generalSettings, website: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
              </div>
              
              {/* Store Information */}
              {stores.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Магазины</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stores.map(store => (
                      <div key={store.id} className="border rounded-lg p-3">
                        <p className="font-medium">{store.name}</p>
                        <p className="text-sm text-gray-600">Код: {store.code}</p>
                        {store.address && <p className="text-sm text-gray-600">{store.address}</p>}
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                          store.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {store.is_active ? 'Активен' : 'Неактивен'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button 
                  onClick={saveGeneralSettings}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Сохранить изменения
                </button>
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
                  <select 
                    value={localizationSettings.language}
                    onChange={(e) => setLocalizationSettings({...localizationSettings, language: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  >
                    <option value="ru">Русский</option>
                    <option value="uz">Узбекский</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Валюта
                  </label>
                  <select 
                    value={localizationSettings.currency}
                    onChange={(e) => setLocalizationSettings({...localizationSettings, currency: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  >
                    <option value="UZS">Узбекский Сум (UZS)</option>
                    <option value="USD">Доллар США (USD)</option>
                    <option value="EUR">Евро (EUR)</option>
                    <option value="RUB">Российский рубль (RUB)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Часовой пояс
                  </label>
                  <select 
                    value={localizationSettings.timezone}
                    onChange={(e) => setLocalizationSettings({...localizationSettings, timezone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  >
                    <option value="UTC+5">UTC+5 (Ташкент)</option>
                    <option value="UTC+3">UTC+3 (Москва)</option>
                    <option value="UTC+4">UTC+4 (Дубай)</option>
                    <option value="UTC+6">UTC+6 (Алматы)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Формат даты
                  </label>
                  <select 
                    value={localizationSettings.date_format}
                    onChange={(e) => setLocalizationSettings({...localizationSettings, date_format: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                    <option value="DD.MM.YYYY">DD.MM.YYYY (31.12.2024)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Формат чисел
                  </label>
                  <select 
                    value={localizationSettings.number_format}
                    onChange={(e) => setLocalizationSettings({...localizationSettings, number_format: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  >
                    <option value="1,234.56">1,234.56 (Английский)</option>
                    <option value="1.234,56">1.234,56 (Европейский)</option>
                    <option value="1 234,56">1 234,56 (Российский)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={saveLocalizationSettings}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Сохранить изменения
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Настройки безопасности</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Минимальная длина пароля
                  </label>
                  <input
                    type="number"
                    value={securitySettings.password_min_length}
                    onChange={(e) => setSecuritySettings({...securitySettings, password_min_length: parseInt(e.target.value)})}
                    min="6"
                    max="32"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Таймаут сессии (минуты)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.session_timeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, session_timeout: parseInt(e.target.value)})}
                    min="5"
                    max="1440"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Максимум попыток входа
                  </label>
                  <input
                    type="number"
                    value={securitySettings.max_login_attempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, max_login_attempts: parseInt(e.target.value)})}
                    min="3"
                    max="10"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Срок действия пароля (дни)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.password_expiry_days}
                    onChange={(e) => setSecuritySettings({...securitySettings, password_expiry_days: parseInt(e.target.value)})}
                    min="0"
                    max="365"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = без срока действия</p>
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={securitySettings.require_two_factor}
                    onChange={(e) => setSecuritySettings({...securitySettings, require_two_factor: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Требовать двухфакторную аутентификацию</span>
                </label>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={saveSecuritySettings}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Сохранить изменения
                </button>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Резервное копирование</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Автоматическое резервное копирование</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={backupSettings.backup_enabled}
                        onChange={(e) => setBackupSettings({...backupSettings, backup_enabled: e.target.checked})}
                        className="rounded" 
                      />
                      <span className="text-sm">Включено</span>
                    </label>
                    
                    {backupSettings.backup_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Частота
                          </label>
                          <select 
                            value={backupSettings.backup_frequency}
                            onChange={(e) => setBackupSettings({...backupSettings, backup_frequency: e.target.value})}
                            className="w-full px-3 py-1 border rounded text-sm"
                          >
                            <option value="hourly">Ежечасно</option>
                            <option value="daily">Ежедневно</option>
                            <option value="weekly">Еженедельно</option>
                            <option value="monthly">Ежемесячно</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Время
                          </label>
                          <input
                            type="time"
                            value={backupSettings.backup_time}
                            onChange={(e) => setBackupSettings({...backupSettings, backup_time: e.target.value})}
                            className="w-full px-3 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Хранить (дни)
                          </label>
                          <input
                            type="number"
                            value={backupSettings.backup_retention_days}
                            onChange={(e) => setBackupSettings({...backupSettings, backup_retention_days: parseInt(e.target.value)})}
                            min="1"
                            max="365"
                            className="w-full px-3 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Последнее резервное копирование</h4>
                  <p className="text-sm text-gray-600">
                    {backupSettings.last_backup 
                      ? new Date(backupSettings.last_backup).toLocaleString('ru-RU')
                      : 'Еще не создано'}
                  </p>
                  {backupSettings.last_backup && (
                    <button 
                      onClick={downloadBackup}
                      className="mt-2 text-sm text-[#475B8D] hover:text-[#475B8D]"
                    >
                      Скачать резервную копию
                    </button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={createBackup}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Создание...' : 'Создать резервную копию сейчас'}
                  </button>
                  <button 
                    onClick={saveBackupSettings}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Сохранить настройки
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Настройки уведомлений</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Каналы уведомлений</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_notifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, email_notifications: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">Email уведомления</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.sms_notifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, sms_notifications: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">SMS уведомления</span>
                    </label>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Уведомления о запасах</h4>
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={notificationSettings.low_stock_alert}
                      onChange={(e) => setNotificationSettings({...notificationSettings, low_stock_alert: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Уведомлять о низких остатках</span>
                  </label>
                  {notificationSettings.low_stock_alert && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Порог для уведомления (единиц)
                      </label>
                      <input
                        type="number"
                        value={notificationSettings.low_stock_threshold}
                        onChange={(e) => setNotificationSettings({...notificationSettings, low_stock_threshold: parseInt(e.target.value)})}
                        min="1"
                        max="100"
                        className="w-32 px-3 py-1 border rounded text-sm"
                      />
                    </div>
                  )}
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Отчеты</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.daily_report}
                        onChange={(e) => setNotificationSettings({...notificationSettings, daily_report: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">Ежедневный отчет</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.weekly_report}
                        onChange={(e) => setNotificationSettings({...notificationSettings, weekly_report: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">Еженедельный отчет</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.monthly_report}
                        onChange={(e) => setNotificationSettings({...notificationSettings, monthly_report: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">Ежемесячный отчет</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={saveNotificationSettings}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Сохранить изменения
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Оборудование</h3>
                <button 
                  onClick={() => setShowEquipmentModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Добавить оборудование
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">№</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Название</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Тип</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Порт</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Версия</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {equipment.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          Нет добавленного оборудования
                        </td>
                      </tr>
                    ) : (
                      equipment.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm">{String(index + 1).padStart(2, '0')}</td>
                          <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                          <td className="px-6 py-4 text-sm">{item.type}</td>
                          <td className="px-6 py-4 text-sm">{item.port}</td>
                          <td className="px-6 py-4 text-sm">{item.version || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.status === 'active' ? 'Активно' : 'Неактивно'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setEditingEquipment(item);
                                  setEquipmentForm(item);
                                  setShowEquipmentModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => deleteEquipment(item.id)}
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
        </div>

        {/* Equipment Modal */}
        {showEquipmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">
                {editingEquipment ? 'Редактировать оборудование' : 'Добавить оборудование'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название *
                  </label>
                  <input
                    type="text"
                    value={equipmentForm.name}
                    onChange={(e) => setEquipmentForm({...equipmentForm, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип
                  </label>
                  <select
                    value={equipmentForm.type}
                    onChange={(e) => setEquipmentForm({...equipmentForm, type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  >
                    <option value="Принтер">Принтер</option>
                    <option value="Сканер штрих-кода">Сканер штрих-кода</option>
                    <option value="Терминал оплаты">Терминал оплаты</option>
                    <option value="Фискальный регистратор">Фискальный регистратор</option>
                    <option value="Весы">Весы</option>
                    <option value="Денежный ящик">Денежный ящик</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Порт подключения
                  </label>
                  <select
                    value={equipmentForm.port}
                    onChange={(e) => setEquipmentForm({...equipmentForm, port: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  >
                    <option value="USB">USB</option>
                    <option value="COM1">COM1</option>
                    <option value="COM2">COM2</option>
                    <option value="LPT">LPT</option>
                    <option value="Bluetooth">Bluetooth</option>
                    <option value="Wi-Fi">Wi-Fi</option>
                    <option value="Ethernet">Ethernet</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Версия прошивки
                  </label>
                  <input
                    type="text"
                    value={equipmentForm.version}
                    onChange={(e) => setEquipmentForm({...equipmentForm, version: e.target.value})}
                    placeholder="Например: 165A53"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <select
                    value={equipmentForm.status}
                    onChange={(e) => setEquipmentForm({...equipmentForm, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#475B8D]"
                  >
                    <option value="active">Активно</option>
                    <option value="inactive">Неактивно</option>
                  </select>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowEquipmentModal(false);
                      resetEquipmentForm();
                    }}
                    className="btn-secondary"
                  >
                    Отмена
                  </button>
                  <button onClick={saveEquipment} className="btn-primary">
                    {editingEquipment ? 'Сохранить' : 'Добавить'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}