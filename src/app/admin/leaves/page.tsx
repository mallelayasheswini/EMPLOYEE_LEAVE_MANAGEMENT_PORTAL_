'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { Toast } from '@/components/Toast';
import { formatDate, formatLeaveType } from '@/lib/utils';
import {
  ListFilter,
  Search,
  Check,
  X,
  MessageSquare,
  Paperclip,
  ExternalLink,
  XCircle,
} from 'lucide-react';

export default function AdminManageLeavesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('ALL');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [managerComment, setManagerComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      if (userData.user.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
      setUser(userData.user);

      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (leaveTypeFilter !== 'ALL') params.append('leaveType', leaveTypeFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/leaves?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data.leaves || []);
      }
    } catch (err) {
      console.error('Error fetching admin leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, leaveTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeaves();
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/leaves/${id}/approve`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Approval failed');
      }

      setToast({ type: 'success', message: 'Leave request approved and balance deducted.' });
      fetchLeaves();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error approving request' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectModal = (id: string) => {
    setSelectedLeaveId(id);
    setManagerComment('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedLeaveId) return;
    if (!managerComment.trim()) {
      setToast({ type: 'error', message: 'Please enter a reason for rejecting this leave request.' });
      return;
    }
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/leaves/${selectedLeaveId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerComment }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Rejection failed');
      }

      setToast({ type: 'success', message: 'Leave request rejected and notification sent to employee.' });
      setRejectModalOpen(false);
      fetchLeaves();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error rejecting request' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && leaves.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Leave Management Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
            <ListFilter className="w-7 h-7 text-amber-400" />
            <span>Manage Employee Leave Requests</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review, approve, or reject submitted leave requests with manager feedback.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, dept, reason..."
              className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-semibold">Type:</span>
              <select
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
                className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900"
              >
                <option value="ALL">All Types</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="EARNED">Earned Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/50">
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Leave Type</th>
                  <th className="px-5 py-3.5">Dates & Days</th>
                  <th className="px-5 py-3.5">Reason & Manager Comment</th>
                  <th className="px-5 py-3.5">Submitted</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      No leave requests matching criteria.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => {
                    const userBalance = l.user?.leaveBalances?.find(
                      (b: any) => b.leaveType === l.leaveType
                    );
                    const avail = userBalance
                      ? userBalance.leaveType === 'UNPAID'
                        ? 'Unlimited'
                        : `${userBalance.allocated - userBalance.used} available`
                      : '';

                    return (
                      <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-white">{l.user.name}</div>
                          <div className="text-xs text-slate-400">{l.user.department}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-200">{formatLeaveType(l.leaveType)}</div>
                          <div className="text-[10px] text-brand-400 font-medium">{avail}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-xs text-slate-300">
                            {formatDate(l.startDate)} - {formatDate(l.endDate)}
                          </div>
                          <div className="text-xs font-bold text-amber-400 mt-0.5">{l.days} day(s)</div>
                        </td>
                        <td className="px-5 py-4 text-xs max-w-sm space-y-1.5">
                          <p className="text-slate-200">{l.reason}</p>

                          {l.managerComment && (
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 text-[11px] flex items-start space-x-1.5">
                              <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-amber-400">Comment:</strong> {l.managerComment}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400">{formatDate(l.createdAt)}</td>
                        <td className="px-5 py-4">
                          <StatusBadge status={l.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          {l.status === 'PENDING' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                disabled={actionLoading}
                                onClick={() => handleApprove(l.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center space-x-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                disabled={actionLoading}
                                onClick={() => handleOpenRejectModal(l.id)}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors flex items-center space-x-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Reject Leave Request</span>
            </h3>

            <p className="text-xs text-slate-400">
              State the reason for rejecting this leave application.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Manager Comment
              </label>
              <textarea
                rows={3}
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="e.g. Mandatory team deployment scheduled during requested dates..."
                className="w-full glass-input p-3 rounded-xl text-sm"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        type={toast?.type || null}
        message={toast?.message || null}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
