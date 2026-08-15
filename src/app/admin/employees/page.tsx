'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { Toast } from '@/components/Toast';
import { formatDate, formatLeaveType } from '@/lib/utils';
import { Users, Search, Building, Mail, Calendar, Eye, Shield, CheckCircle2, UserPlus, X, Lock } from 'lucide-react';

export default function AdminEmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Detail Modal State
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDepartment, setNewDepartment] = useState('Software Engineering');
  const [newRole, setNewRole] = useState('EMPLOYEE');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchEmployees = async () => {
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
      if (deptFilter !== 'ALL') params.append('department', deptFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/employees?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [deptFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const res = await fetch('/api/admin/employees/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          department: newDepartment,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setToast({ type: 'success', message: data.message || 'Account created successfully.' });
      setCreateModalOpen(false);
      // Reset fields
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      fetchEmployees();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error creating account' });
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Employee Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
              <Users className="w-7 h-7 text-amber-400" />
              <span>Employee Directory & Leave Auditing</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Monitor workforce balances and create managed Employee or Admin accounts.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee by name, email..."
              className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs"
            />
          </form>

          <div className="flex items-center space-x-2 text-xs w-full md:w-auto">
            <span className="text-slate-400 font-semibold">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900"
            >
              <option value="ALL">All Departments</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Product Marketing">Product Marketing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance & Ops">Finance & Ops</option>
              <option value="Management">Management</option>
            </select>
          </div>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => {
            const pendingCount = emp.leaveRequests?.filter((r: any) => r.status === 'PENDING').length || 0;
            const approvedCount = emp.leaveRequests?.filter((r: any) => r.status === 'APPROVED').length || 0;

            return (
              <div key={emp.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-brand-500/20">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{emp.name}</h3>
                      <div className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{emp.email}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      emp.role === 'ADMIN'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                    }`}
                  >
                    {emp.role}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-2 border-y border-slate-800/80">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{emp.department}</span>
                  </span>
                  <span className="text-slate-400">
                    Joined: {formatDate(emp.createdAt)}
                  </span>
                </div>

                {/* Balances Summary */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Leave Balances (Used / Allocated)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {emp.leaveBalances?.map((b: any) => (
                      <div key={b.id} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <div className="text-[10px] text-slate-400">{formatLeaveType(b.leaveType)}</div>
                        <div className="font-bold text-white mt-0.5">
                          {b.leaveType === 'UNPAID' ? `${b.used} taken` : `${b.used} / ${b.allocated}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span>
                      <strong className="text-amber-400">{pendingCount}</strong> pending
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-emerald-400">{approvedCount}</strong> approved
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedEmp(emp)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Admin Create Account Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>Create User / Admin Account</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Michael Scott"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="michael@company.com"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-300 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-300 mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Product Marketing">Product Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Ops">Finance & Ops</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin / Manager</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-3xl max-w-2xl w-full border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white">{selectedEmp.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedEmp.email} • {selectedEmp.department} ({selectedEmp.role})
                </p>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Leave History Log */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>Complete Leave Applications History</span>
              </h4>

              <div className="space-y-2">
                {selectedEmp.leaveRequests?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No leave requests submitted yet.</p>
                ) : (
                  selectedEmp.leaveRequests?.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-xl glass-card border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-white">
                          {formatLeaveType(r.leaveType)} ({r.days} day(s))
                        </div>
                        <div className="text-slate-300">
                          {formatDate(r.startDate)} - {formatDate(r.endDate)}
                        </div>
                        <div className="text-slate-400">{r.reason}</div>
                        {r.managerComment && (
                          <div className="text-amber-300 font-medium">
                            Manager Comment: {r.managerComment}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEmp(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close
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
