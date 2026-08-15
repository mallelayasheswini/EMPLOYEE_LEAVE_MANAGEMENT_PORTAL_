'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Shield, Users, CheckCircle2, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          if (data.user.role === 'ADMIN') {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Leave Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-brand-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cloud Application SaaS Demo</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl text-white leading-tight">
          Modern Employee <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-400 to-sky-400">Leave Management</span> Portal
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Digitize employee leave applications, real-time balance tracking, multi-tier approvals, manager comments, and administrative analytics in a centralized cloud platform.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-105"
          >
            <span>Sign In to Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-panel hover:bg-slate-800/80 border-slate-700 text-slate-200 font-semibold text-sm transition-all"
          >
            Register Employee / Admin
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Leave Balances & Overlaps</h3>
            <p className="text-sm text-slate-400">
              Track Casual, Sick, Earned, and Unpaid leave. Instant duration calculation with overlap detection and balance locking.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Role-Based Approvals</h3>
            <p className="text-sm text-slate-400">
              Managers and Administrators review pending requests, approve with automated balance deduction, or reject with custom feedback.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Employee Analytics</h3>
            <p className="text-sm text-slate-400">
              Department-level statistics, complete employee directory, leave history filtering, and real-time audit trails.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        © 2026 Employee Leave Management Portal • Built with Next.js 14, Tailwind CSS, Prisma & SQLite
      </footer>
    </div>
  );
}
