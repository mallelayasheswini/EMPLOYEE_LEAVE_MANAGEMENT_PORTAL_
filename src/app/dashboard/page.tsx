'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { Toast } from '@/components/Toast';
import { formatDate, formatLeaveType } from '@/lib/utils';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FilePlus,
  ArrowRight,
  TrendingUp,
  User,
  Building,
  Mail,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Ban,
} from 'lucide-react';

export default function EmployeeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      // Fetch balances & leaves
      const [balRes, leaveRes] = await Promise.all([
        fetch('/api/leaves/balances'),
        fetch('/api/leaves'),
      ]);

      if (balRes.ok) {
        const balData = await balRes.json();
        setBalances(balData.balances || []);
      }

      if (leaveRes.ok) {
        const leaveData = await leaveRes.json();
        setLeaves(leaveData.leaves || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelLeave = async (leaveId: string) => {
    if (!confirm('Are you sure you want to cancel this pending leave request?')) return;

    try {
      const res = await fetch(`/api/leaves/${leaveId}/cancel`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel leave request');
      }

      setToast({ type: 'success', message: 'Leave request cancelled successfully.' });
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error cancelling request' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalRequests = leaves.length;
  const pendingRequests = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedRequests = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejectedRequests = leaves.filter((l) => l.status === 'REJECTED').length;

  // Upcoming approved leave
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingLeave = leaves.find(
    (l) => l.status === 'APPROVED' && new Date(l.startDate) >= today
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Welcome Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 z-10">
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Employee Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Hello, {user?.name}!
            </h1>
            <p className="text-sm text-slate-400">
              Manage your leave requests, track balances, and stay updated on approvals.
            </p>
          </div>

          <div className="flex items-center space-x-3 z-10 w-full sm:w-auto">
            <Link
              href="/apply-leave"
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-xl shadow-brand-500/25 transition-all hover:scale-105"
            >
              <FilePlus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </Link>
            <button
              onClick={fetchData}
              className="p-3 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upcoming Approved Leave Alert */}
        {upcomingLeave && (
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-300">Upcoming Approved Leave</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {formatLeaveType(upcomingLeave.leaveType)} from{' '}
                  <span className="font-semibold text-white">{formatDate(upcomingLeave.startDate)}</span> to{' '}
                  <span className="font-semibold text-white">{formatDate(upcomingLeave.endDate)}</span> ({upcomingLeave.days} day(s))
                </p>
              </div>
            </div>
            <StatusBadge status="APPROVED" />
          </div>
        )}

        {/* Leave Balances Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-brand-400" />
            <span>Leave Balances</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {balances.map((b) => {
              const isUnpaid = b.leaveType === 'UNPAID';
              const remaining = isUnpaid ? 'N/A' : b.allocated - b.used;
              const percentUsed = isUnpaid ? 0 : Math.min(100, Math.round((b.used / b.allocated) * 100));

              return (
                <div key={b.id} className="glass-card p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {formatLeaveType(b.leaveType)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-brand-400 font-semibold border border-slate-700">
                      {isUnpaid ? 'Unlimited' : `${remaining} Available`}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-3xl font-extrabold text-white">{b.used}</span>
                      <span className="text-xs text-slate-400 font-medium">
                        {isUnpaid ? 'Days Taken' : `/ ${b.allocated} Allocated`}
                      </span>
                    </div>

                    {!isUnpaid && (
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentUsed > 80
                              ? 'bg-rose-500'
                              : percentUsed > 50
                              ? 'bg-amber-500'
                              : 'bg-gradient-to-r from-brand-500 to-indigo-500'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border-l-4 border-slate-500">
            <div className="text-xs font-semibold text-slate-400 uppercase">Total Requests</div>
            <div className="text-2xl font-extrabold text-white mt-1">{totalRequests}</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border-l-4 border-amber-500">
            <div className="text-xs font-semibold text-amber-400 uppercase">Pending Review</div>
            <div className="text-2xl font-extrabold text-white mt-1">{pendingRequests}</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border-l-4 border-emerald-500">
            <div className="text-xs font-semibold text-emerald-400 uppercase">Approved</div>
            <div className="text-2xl font-extrabold text-white mt-1">{approvedRequests}</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border-l-4 border-rose-500">
            <div className="text-xs font-semibold text-rose-400 uppercase">Rejected</div>
            <div className="text-2xl font-extrabold text-white mt-1">{rejectedRequests}</div>
          </div>
        </div>

        {/* Recent Leave Requests Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Leave Requests</h2>
              <p className="text-xs text-slate-400">Your latest leave submissions and status updates</p>
            </div>
            <Link
              href="/my-leaves"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/50">
                  <th className="px-5 py-3">Leave Type</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Days</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaves.slice(0, 5).map((l) => (
                    <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-200">
                        {formatLeaveType(l.leaveType)}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-300">
                        {formatDate(l.startDate)} - {formatDate(l.endDate)}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-brand-400">{l.days} day(s)</td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 max-w-xs truncate">
                        {l.reason}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {l.status === 'PENDING' ? (
                          <button
                            onClick={() => handleCancelLeave(l.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Toast
        type={toast?.type || null}
        message={toast?.message || null}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
