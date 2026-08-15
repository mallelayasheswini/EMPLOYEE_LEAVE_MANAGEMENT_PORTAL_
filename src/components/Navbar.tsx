'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LogOut,
  Calendar,
  Shield,
  User as UserIcon,
  LayoutDashboard,
  FilePlus,
  ListFilter,
  Users,
  Bell,
  CheckCircle2,
  XCircle,
  Info,
  CheckCheck,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Mark notifications read error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                LeaveManager
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider text-brand-400 font-semibold ml-2 px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                SaaS Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1">
            {isAdmin ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/dashboard'
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </Link>
                <Link
                  href="/admin/leaves"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/leaves'
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                  <span>Manage Requests</span>
                </Link>
                <Link
                  href="/admin/employees"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/employees'
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Employees</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/apply-leave"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/apply-leave'
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Apply Leave</span>
                </Link>
                <Link
                  href="/my-leaves"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/my-leaves'
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                  <span>My Leaves</span>
                </Link>
              </>
            )}
          </nav>
        )}

        {/* User Profile & Actions */}
        {user ? (
          <div className="flex items-center space-x-3 relative">
            {/* Notification Bell Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (unreadCount > 0) handleMarkAllRead();
                }}
                className="p-2 rounded-xl text-slate-300 hover:text-white glass-card border-slate-700/60 relative transition-all"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl border border-slate-800 shadow-2xl z-50 overflow-hidden space-y-2 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-brand-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Notifications
                      </h4>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 space-y-1 transition-colors ${
                            !n.read ? 'bg-brand-500/5' : 'hover:bg-slate-900/40'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2 font-bold text-white">
                              {n.type === 'SUCCESS' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : n.type === 'DANGER' ? (
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              ) : (
                                <Info className="w-4 h-4 text-brand-400 shrink-0" />
                              )}
                              <span>{n.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {formatDate(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed pl-6">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-white">{user.name}</span>
              <div className="flex items-center justify-end space-x-1.5 text-xs text-slate-400">
                <span>{user.department}</span>
                <span>•</span>
                <span className={`font-medium ${isAdmin ? 'text-amber-400' : 'text-brand-400'}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-bold text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-lg shadow-lg shadow-brand-500/20 transition-all"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
