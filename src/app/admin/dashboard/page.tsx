'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { Toast } from '@/components/Toast';
import { formatDate, formatLeaveType } from '@/lib/utils';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  Shield,
  ArrowRight,
  Check,
  X,
  Cloud,
  Database,
  Download,
  UploadCloud,
  ExternalLink,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // AWS S3 Cloud State
  const [awsBackups, setAwsBackups] = useState<any[]>([]);
  const [backingUp, setBackingUp] = useState(false);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [managerComment, setManagerComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStats = async () => {
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

      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Fetch live AWS S3 Backups list
      const backupRes = await fetch('/api/admin/aws-backup');
      if (backupRes.ok) {
        const backupData = await backupRes.json();
        setAwsBackups(backupData.backups || []);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTriggerAwsBackup = async () => {
    setBackingUp(true);
    try {
      const res = await fetch('/api/admin/aws-backup', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to trigger AWS S3 backup');
      }

      setToast({
        type: 'success',
        message: 'System database successfully backed up to Live AWS S3 Cloud Bucket!',
      });
      fetchStats();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'AWS Backup Failed' });
    } finally {
      setBackingUp(false);
    }
  };

  const handleApprove = async (leaveId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/leaves/${leaveId}/approve`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve request');
      }

      setToast({ type: 'success', message: 'Leave request approved and balance deducted.' });
      fetchStats();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Approval error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectModal = (leaveId: string) => {
    setSelectedLeaveId(leaveId);
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
        throw new Error(data.error || 'Failed to reject request');
      }

      setToast({ type: 'success', message: 'Leave request rejected and notification sent to employee.' });
      setRejectModalOpen(false);
      fetchStats();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Rejection error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 z-10">
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Administrator Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Admin Control Center
            </h1>
            <p className="text-sm text-slate-400">
              Overview of employee leave statistics, AWS Cloud integrations, and workforce analytics.
            </p>
          </div>

          <div className="flex items-center space-x-3 z-10 w-full sm:w-auto">
            <Link
              href="/admin/leaves"
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Clock className="w-4 h-4" />
              <span>Review Pending ({stats?.pendingRequests || 0})</span>
            </Link>
          </div>
        </div>

        {/* LIVE AWS CLOUD INTEGRATION PANEL */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-indigo-950/20 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <span>AWS Cloud Infrastructure Status</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    LIVE CONNECTED
                  </span>
                </h3>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  AWS Region: <strong className="text-white">us-east-1</strong> | S3 Bucket:{' '}
                  <strong className="text-indigo-300">yasheswini-leave-portal-1786762161</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerAwsBackup}
              disabled={backingUp}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{backingUp ? 'Backing up to AWS S3...' : 'Backup Database to AWS S3'}</span>
            </button>
          </div>

          {/* AWS S3 Backups List */}
          {awsBackups.length > 0 && (
            <div className="pt-3 border-t border-indigo-500/20 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Live AWS S3 Database Backups ({awsBackups.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {awsBackups.slice(0, 4).map((b) => (
                  <a
                    key={b.key}
                    href={b.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between transition-all group"
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold text-slate-200 truncate">{b.key}</p>
                      <p className="text-[10px] text-slate-400">
                        {formatDate(b.lastModified)} • {(b.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-card p-5 rounded-2xl border-l-4 border-brand-500 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Total Employees</span>
              <Users className="w-4 h-4 text-brand-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stats?.totalEmployees || 0}</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border-l-4 border-indigo-500 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Total Requests</span>
              <Calendar className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stats?.totalRequests || 0}</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border-l-4 border-amber-500 space-y-1">
            <div className="flex items-center justify-between text-amber-400 text-xs font-semibold uppercase">
              <span>Pending Action</span>
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stats?.pendingRequests || 0}</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border-l-4 border-emerald-500 space-y-1">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold uppercase">
              <span>Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stats?.approvedRequests || 0}</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border-l-4 border-rose-500 space-y-1">
            <div className="flex items-center justify-between text-rose-400 text-xs font-semibold uppercase">
              <span>Rejected</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stats?.rejectedRequests || 0}</div>
          </div>
        </div>

        {/* Analytics Breakdown Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department Breakdown */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Building className="w-5 h-5 text-brand-400" />
              <span>Department Distribution</span>
            </h3>

            <div className="space-y-3">
              {stats?.departments?.map((d: any) => (
                <div key={d.department} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="font-semibold">{d.department}</span>
                    <span className="text-brand-400 font-bold">{d.count} Employee(s)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (d.count / (stats?.totalEmployees || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Type Distribution */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Leave Category Totals</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {stats?.leaveTypeCounts?.map((tc: any) => (
                <div key={tc.leaveType} className="glass-card p-4 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    {formatLeaveType(tc.leaveType)}
                  </span>
                  <div className="text-xl font-extrabold text-white">{tc._count.id} Request(s)</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Submissions & Quick Approval Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Submissions</h2>
              <p className="text-xs text-slate-400">Manage employee leave requests directly</p>
            </div>
            <Link
              href="/admin/leaves"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              <span>View All Requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/50">
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Leave Type</th>
                  <th className="px-5 py-3.5">Dates</th>
                  <th className="px-5 py-3.5">Days</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {stats?.recentRequests?.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{r.user.name}</div>
                      <div className="text-xs text-slate-400">{r.user.department}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-200">
                      {formatLeaveType(r.leaveType)}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-300">
                      {formatDate(r.startDate)} - {formatDate(r.endDate)}
                    </td>
                    <td className="px-5 py-4 font-bold text-brand-400">{r.days} day(s)</td>
                    <td className="px-5 py-4 text-xs text-slate-400 max-w-xs truncate">{r.reason}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {r.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleApprove(r.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleOpenRejectModal(r.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
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
              Provide an optional comment for the employee explaining why this leave request is being rejected.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Manager Comment
              </label>
              <textarea
                rows={3}
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="e.g. Critical release scheduled during these dates..."
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
