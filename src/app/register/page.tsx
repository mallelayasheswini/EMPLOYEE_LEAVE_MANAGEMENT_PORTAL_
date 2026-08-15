'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Lock, Mail, User, Building, ShieldCheck, ArrowRight, AlertCircle, UserCheck, Heart } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

interface ManagerOption {
  id: string;
  name: string;
  email: string;
  department: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Software Engineering');
  const [gender, setGender] = useState('FEMALE');
  const [managerId, setManagerId] = useState('');
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/managers')
      .then((res) => res.json())
      .then((data) => {
        if (data.managers) {
          setManagers(data.managers);
          if (data.managers.length > 0) {
            setManagerId(data.managers[0].id);
          }
        }
      })
      .catch((err) => console.error('Fetch Managers Error:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, department, gender, managerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={null} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-xl shadow-brand-500/20 mb-2">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Employee Registration
            </h1>
            <p className="text-sm text-slate-400">
              Create your employee account to manage leave applications
            </p>
          </div>

          {/* Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

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
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Gender
                </label>
                <div className="relative">
                  <Heart className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm appearance-none bg-slate-900 text-slate-100"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm appearance-none bg-slate-900"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Product Marketing">Product Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Ops">Finance & Ops</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Reporting Manager
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-brand-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm appearance-none bg-slate-900"
                  >
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email}) - Admin Manager
                      </option>
                    ))}
                    {managers.length === 0 && (
                      <option value="">Yasheswini Mallela (yasheswinireddy18@gmail.com)</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                <span>
                  <strong>Account Role:</strong> Self-registration creates an Employee account reporting to Manager <strong>Yasheswini Mallela</strong>.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/register" className="text-brand-400 font-semibold hover:underline">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
