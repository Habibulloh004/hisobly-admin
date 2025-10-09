"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Gift,
  Plug,
  Settings,
  Warehouse,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Главная страница', href: '/', icon: LayoutDashboard },
  { name: 'Товары', href: '/products', icon: Package },
  { name: 'Склад', href: '/warehouse', icon: Warehouse },
  { name: 'Продажи', href: '/sales', icon: ShoppingCart },
  { name: 'Сотрудники', href: '/staff', icon: Users },
  { name: 'Отчеты и аналитика', href: '/analytics', icon: BarChart3 },
  { name: 'Программы лояльности', href: '/bonuses', icon: Gift },
  { name: 'Интеграции', href: '/integration', icon: Plug },
  { name: 'Настройки системы', href: '/settings', icon: Settings },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b ">
            <h1 className="text-2xl font-bold text-center w-full text-[#475B8D]">Hisobly</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="h-10 w-10 rounded-full bg-[#475B8D] flex items-center justify-center">
                <span className="text-[#475B8D] font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">Директор</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-2 w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <button
          onClick={() => setSidebarOpen(true)}
          className={`fixed right-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-gray-700 shadow-lg ring-1 ring-black/5 backdrop-blur transition-all duration-300 hover:bg-white lg:hidden ${
            sidebarOpen ? 'scale-95 rotate-90' : 'scale-100 rotate-0'
          }`}
          aria-label="Открыть меню"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
