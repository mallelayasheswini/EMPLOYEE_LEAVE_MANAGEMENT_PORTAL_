'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { Toast } from '@/components/Toast';
import { formatDate, formatLeaveType } from '@/lib/utils';
import { Calendar, Filter, Clock, Ban, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MyLeavesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      const res = await fetch(`/api/leaves?status=${activeFilter}`);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data.leaves || []);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [activeFilter]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this pending leave request?')) return;

    try {
      const res = await fetch(`/api/leaves/${id}/cancel`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel request');
      }

      setToast({ type: 'success', message: 'Leave request cancelled.' });
      fetchLeaves();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error cancelling request' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Leave History...</p>
        </div>
      </div>
    );
  }

  const filterTabs = [
    { id: 'ALL', label: 'All Requests' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
              <Calendar className="w-7 h-7 text-brand-400" />
              <span>My Leave History</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              View past applications, manager comments, and cancel pending requests.
            </p>
          </div>

          <Link
            href="/apply-leave"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all"
          >
            + Apply New Leave
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaves Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/50">
                  <th className="px-5 py-3.5">Leave Type</th>
                  <th className="px-5 py-3.5">Start Date</th>
                  <th className="px-5 py-3.5">End Date</th>
                  <th className="px-5 py-3.5">Days</th>
                  <th className="px-5 py-3.5">Reason & Manager Comment</th>
                  <th className="px-5 py-3.5">Applied On</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      No leave requests found for this filter.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-white">
                        {formatLeaveType(l.leaveType)}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-300">{formatDate(l.startDate)}</td>
                      <td className="px-5 py-4 text-xs text-slate-300">{formatDate(l.endDate)}</td>
                      <td className="px-5 py-4 font-bold text-brand-400">{l.days} day(s)</td>
                      <td className="px-5 py-4 text-xs max-w-sm space-y-1">
                        <p className="text-slate-200">{l.reason}</p>
                        {l.managerComment && (
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 text-[11px] flex items-start space-x-1.5 mt-1">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-amber-400">Manager:</strong> {l.managerComment}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {formatDate(l.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {l.status === 'PENDING' ? (
                          <button
                            onClick={() => handleCancel(l.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
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
