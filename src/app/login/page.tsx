'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Lock, Mail, ArrowRight, Shield, UserCheck, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={null} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-xl shadow-brand-500/20 mb-2">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-400">
              Sign in to your Employee Leave Management account
            </p>
          </div>

          {/* Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 text-slate-400 font-semibold">
                  Demo Viva Credentials
                </span>
              </div>
            </div>

            {/* Quick Demo Login Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@company.com', 'Admin@123')}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 font-bold text-amber-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">admin@company.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('john.doe@company.com', 'Employee@123')}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 font-bold text-brand-400">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>John Doe</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">Engineering</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sarah.smith@company.com', 'Employee@123')}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 font-bold text-brand-400">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sarah Smith</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">UI/UX Design</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex.jones@company.com', 'Employee@123')}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-1.5 font-bold text-brand-400">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Alex Jones</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">Marketing</div>
              </button>
            </div>

            <div className="text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-brand-400 font-semibold hover:underline">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
