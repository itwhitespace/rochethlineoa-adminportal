'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Clock,
  UserCheck,
  Link2,
  Megaphone,
  FileJson,
  Eye
} from 'lucide-react';
import { isDatabaseConfigured } from '@/lib/database';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('admin@roche.com');
  const [adminRole, setAdminRole] = useState('Admin');

  // Check auth and theme
  useEffect(() => {
    // 1. Auth Gate Check
    const sessionStr = localStorage.getItem('roche_admin_session');
    if (!sessionStr && !document.cookie.includes('roche_admin_logged_in')) {
      router.push('/login');
      return;
    } else if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.user?.email) {
          setAdminEmail(session.user.email);
        }
        if (session.user?.role) {
          setAdminRole(session.user.role);
        }
      } catch (e) {}
    }

    // 2. Connection status Check
    setIsLive(isDatabaseConfigured());

    // 3. Theme Initialization
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('roche_theme') === 'dark' ||
                   (!('roche_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      setDarkMode(false);
    }

    setLoading(false);
  }, [router, pathname]);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('roche_theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('roche_theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('roche_admin_session');
    document.cookie = "roche_admin_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/login');
  };

  const menuItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Content Analytics', href: '/admin/content-analytics', icon: BarChart3 },
    { name: 'Visitors', href: '/admin/visitors', icon: Clock },
    { name: 'Members', href: '/admin/members', icon: UserCheck },
    { name: 'Generate URL Tracking', href: '/admin/generate-url', icon: Link2 },
    { name: 'Flex Message Builder', href: '/admin/flex-builder', icon: FileJson },

    { name: 'Impression Data', href: '/admin/impression-data', icon: Eye },
    { name: 'Setting', href: '/admin/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-950 lg:static lg:translate-x-0 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Branding Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <span className="h-6 w-1 bg-brand-blue rounded-full"></span>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              Roche Analytics
            </h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold' 
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Profile & Logout */}
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-900">
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <User className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{adminRole}</p>
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100" title={adminEmail}>
                {adminEmail}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-900 dark:bg-zinc-950 transition-colors duration-200">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Connection status badge */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
              isLive 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50' 
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
            }`}>
              {isLive ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Database Connected</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  <span>Simulation (Mock Mode)</span>
                </>
              )}
            </div>
          </div>

          {/* User action items (Theme toggle) */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 border border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-all"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
