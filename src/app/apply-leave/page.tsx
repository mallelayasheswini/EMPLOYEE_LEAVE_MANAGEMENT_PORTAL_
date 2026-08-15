'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Toast } from '@/components/Toast';
import { calculateLeaveDays } from '@/lib/validations';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  Clock,
  RotateCcw,
  HelpCircle,
  X,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import Link from 'next/link';

interface AbsenceRecord {
  id: string;
  employeeName: string;
  department: string;
  leaveType: string;
  status: string;
  startDate: string;
  endDate: string;
  days: number;
  isCurrentUser: boolean;
}

export default function ApplyLeavePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const [teamAbsences, setTeamAbsences] = useState<AbsenceRecord[]>([]);
  const [showTeamAbsencesModal, setShowTeamAbsencesModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calendar Month Navigation (showing 2 consecutive months)
  const [baseDate, setBaseDate] = useState(new Date(2026, 7, 1)); // August 2026

  // Form State
  const [timeType, setTimeType] = useState('Flexible Vacation - India');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Proof File Upload State for Parental & Adoption Leaves
  const [file, setFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [s3Key, setS3Key] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.user) {
          router.push('/login');
          return;
        }
        setUser(data.user);
      });

    fetch('/api/leaves/balances')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setBalances(data?.balances || []);
      });

    fetch('/api/leaves')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setMyLeaves(data?.leaves || []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Query Team Absences whenever start/end dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetch(`/api/leaves/team-absences?startDate=${startDate}&endDate=${endDate}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.absences) {
            setTeamAbsences(data.absences);
          }
        })
        .catch((err) => console.error(err));
    } else {
      setTeamAbsences([]);
    }
  }, [startDate, endDate]);

  // Check if proof document upload is mandatory for current time type
  const isProofRequired =
    timeType === 'Primary Parental Leave' ||
    timeType === 'Secondary Parental Leave' ||
    timeType.includes('Adoption');

  // Days calculation
  const calculatedDays = startDate && endDate ? calculateLeaveDays(startDate, endDate) : 0;

  // Clear date selection
  const clearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  // Handle file select and immediate upload to AWS S3
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds maximum 5MB limit.');
      return;
    }

    setFile(selectedFile);
    setUploadingFile(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload proof document');
      }

      setAttachmentUrl(data.attachmentUrl);
      setS3Key(data.s3Key);
      setToast({ type: 'success', message: 'Proof document uploaded to AWS S3 successfully!' });
    } catch (err: any) {
      setError(err.message || 'Error uploading document to AWS S3');
      setFile(null);
    } finally {
      setUploadingFile(false);
    }
  };

  // Calendar Date click selection logic
  const handleDateClick = (dateStr: string) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate('');
    } else if (startDate && !endDate) {
      if (new Date(dateStr) < new Date(startDate)) {
        setStartDate(dateStr);
        setEndDate('');
      } else {
        setEndDate(dateStr);
      }
    }
  };

  const nextMonth = () => {
    setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1));
  };

  // Generate calendar grid for a given month offset (0 = current, 1 = next month)
  const renderCalendarMonth = (monthOffset: number) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth() + monthOffset;
    const currentMonthDate = new Date(year, month, 1);

    const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });
    const yearNum = currentMonthDate.getFullYear();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    return (
      <div className="flex-1 min-w-[280px]">
        <div className="text-center font-bold text-slate-200 text-sm mb-3">
          {monthName} {yearNum}
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
          {days.map((dayNum, idx) => {
            if (!dayNum) {
              return <div key={`empty-${idx}`} className="h-9" />;
            }

            const currentDayObj = new Date(year, month, dayNum);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayOfWeek = currentDayObj.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            const isToday =
              currentDayObj.getDate() === new Date().getDate() &&
              currentDayObj.getMonth() === new Date().getMonth() &&
              currentDayObj.getFullYear() === new Date().getFullYear();

            const isStart = startDate === dateStr;
            const isEnd = endDate === dateStr;
            const isInRange =
              startDate &&
              endDate &&
              new Date(dateStr) >= new Date(startDate) &&
              new Date(dateStr) <= new Date(endDate);

            // Check existing leaves for styling
            const approvedLeave = myLeaves.find(
              (l) =>
                l.status === 'APPROVED' &&
                new Date(dateStr) >= new Date(l.startDate) &&
                new Date(dateStr) <= new Date(l.endDate)
            );

            const pendingLeave = myLeaves.find(
              (l) =>
                l.status === 'PENDING' &&
                new Date(dateStr) >= new Date(l.startDate) &&
                new Date(dateStr) <= new Date(l.endDate)
            );

            let dayClasses = 'h-9 rounded-lg flex items-center justify-center font-medium cursor-pointer transition-all border text-slate-200 relative ';

            if (isStart || isEnd) {
              dayClasses += 'bg-cyan-500 text-slate-950 border-cyan-300 font-extrabold shadow-md shadow-cyan-500/40 ';
            } else if (isInRange) {
              dayClasses += 'bg-cyan-500/25 border-cyan-400/60 text-cyan-100 font-bold ';
            } else if (approvedLeave) {
              dayClasses += 'bg-emerald-600/30 border-emerald-500/50 text-emerald-200 font-bold ';
            } else if (pendingLeave) {
              dayClasses += 'bg-amber-600/30 border-amber-500/50 text-amber-200 font-bold ';
            } else if (isWeekend) {
              dayClasses += 'bg-slate-900/60 border-slate-800 text-slate-500 ';
            } else {
              dayClasses += 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800 hover:border-slate-700 text-slate-300 ';
            }

            if (isToday && !isStart && !isEnd) {
              dayClasses += 'ring-2 ring-purple-500 ring-offset-1 ring-offset-slate-950 ';
            }

            return (
              <div
                key={dateStr}
                onClick={() => handleDateClick(dateStr)}
                className={dayClasses}
              >
                <span>{dayNum}</span>
                {isStart && !isEnd && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300"></span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate || !reason.trim()) {
      setError('Please select start and end dates on the calendar and enter a reason.');
      return;
    }

    if (calculatedDays <= 0) {
      setError('End date must be equal to or after start date.');
      return;
    }

    if (isProofRequired && !attachmentUrl) {
      setError('Proof document file upload is mandatory for Parental and Adoption leave requests.');
      return;
    }

    // Map timeType label to system enum
    let leaveTypeEnum = 'CASUAL';
    if (timeType.includes('Sick')) leaveTypeEnum = 'SICK';
    else if (timeType === 'Primary Parental Leave') leaveTypeEnum = 'PARENTAL';
    else if (timeType === 'Secondary Parental Leave') leaveTypeEnum = 'SECONDARY_PARENTAL';
    else if (timeType.includes('Special Medical')) leaveTypeEnum = 'SPECIAL_MEDICAL';
    else if (timeType.includes('Menstrual')) leaveTypeEnum = 'MENSTRUAL';
    else if (timeType.includes('Adoption')) leaveTypeEnum = 'ADOPTION';
    else if (timeType.includes('Charitable')) leaveTypeEnum = 'CHARITABLE';
    else if (timeType.includes('Unpaid')) leaveTypeEnum = 'UNPAID';
    else if (timeType.includes('Vacation')) leaveTypeEnum = 'CASUAL';

    setSubmitting(true);

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveType: leaveTypeEnum,
          startDate,
          endDate,
          reason: `[${timeType}] ${reason}`,
          attachmentUrl,
          s3Key,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit leave request');
      }

      setToast({
        type: 'success',
        message: 'Leave application submitted successfully! Redirecting to My Leaves...',
      });

      setTimeout(() => {
        router.push('/my-leaves');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error submitting leave request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Calendar & Absence Form...</p>
        </div>
      </div>
    );
  }

  const isFemale = user?.gender === 'FEMALE';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb & Top Bar matching Screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="text-xs text-slate-400 font-medium tracking-wide">
              People Profile / <span className="text-slate-200">Time Off</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">Time Off Calendar</h1>
          </div>

          <button
            onClick={() => setShowTeamAbsencesModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-brand-400 transition-all"
          >
            <Users className="w-4 h-4 text-brand-400" />
            <span>Show Team Absences</span>
          </button>
        </div>

        {/* Main Content Grid (Left Calendar, Right Create Absence Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Interactive Dual-Month Calendar (7 cols) */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
            {/* Interactive Instruction Banner */}
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-cyan-200">
                <CalendarIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  {!startDate ? (
                    <strong>Step 1:</strong>
                  ) : !endDate ? (
                    <strong>Step 2:</strong>
                  ) : (
                    <strong>Selected Range:</strong>
                  )}
                  {!startDate && ' Click a date on the calendar below to select your START date.'}
                  {startDate && !endDate && ` Start Date set to ${startDate}. Now click another date to select your END date.`}
                  {startDate && endDate && ` ${startDate} to ${endDate} (${calculatedDays} Day(s))`}'
                </span>
              </div>

              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={clearDates}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300 transition-all"
                >
                  <RotateCcw className="w-3 h-3 text-cyan-400" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Month Header Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-sm font-semibold text-slate-300">
                Interactive Start & End Date Selection
              </div>

              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dual Calendar Grid */}
            <div className="flex flex-col md:flex-row gap-6">
              {renderCalendarMonth(0)}
              {renderCalendarMonth(1)}
            </div>

            {/* Legend (matching screenshot layout) */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded border-2 border-purple-500 bg-slate-900 inline-block" />
                  <span>Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-600/40 border border-emerald-500 inline-block" />
                  <span>Approved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded bg-cyan-500 border border-cyan-300 inline-block" />
                  <span>Selected Range</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded bg-amber-600/40 border border-amber-500 inline-block" />
                  <span>Pending Leave</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-800 inline-block" />
                  <span>Non-Working / Holiday</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: "Create Absence" Form matching user picture (5 cols) */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-xl font-extrabold text-white">Create Absence</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your time off category and confirm your dates
              </p>
            </div>

            {error && (
              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Time Type Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1">
                  <span>Time Type</span>
                  <span className="text-rose-400">*</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 inline ml-1" />
                </label>
                <select
                  value={timeType}
                  onChange={(e) => setTimeType(e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm bg-slate-900 border border-brand-500/50 focus:border-brand-400"
                >
                  <option value="Flexible Vacation - India">Flexible Vacation - India</option>
                  <option value="Sick Leave - India">Sick Leave - India</option>
                  <option value="Primary Parental Leave">Primary Parental Leave</option>
                  <option value="Secondary Parental Leave">Secondary Parental Leave</option>
                  <option value="Special Medical Leave - India">Special Medical Leave - India</option>
                  {isFemale && <option value="Menstrual Leave - India">Menstrual Leave - India</option>}
                  <option value="Adoption - India">Adoption - India</option>
                  <option value="Charitable Works">Charitable Works</option>
                  <option value="Unpaid Leave - India">Unpaid Leave - India</option>
                  <option value="Personal Unpaid Leave">Personal Unpaid Leave</option>
                </select>
              </div>

              {/* Mandatory Proof Attachment Input for Parental & Adoption Leaves */}
              {isProofRequired && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    <span>Upload Supporting Proof Document (Required)</span>
                  </label>

                  <input
                    type="file"
                    required={!attachmentUrl}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer"
                  />

                  {uploadingFile && (
                    <p className="text-[11px] text-amber-300 font-medium animate-pulse">
                      Uploading proof document to AWS S3...
                    </p>
                  )}

                  {attachmentUrl && (
                    <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold pt-1">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span className="truncate">Proof uploaded to AWS S3 ({file?.name})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Start & End Date Selection Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs border border-slate-700"
                  />
                </div>
              </div>

              {/* Calculated Days & Live Team Absence Counter */}
              {calculatedDays > 0 && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-slate-300 font-medium">
                      <Clock className="w-4 h-4 text-brand-400" />
                      <span>Absence Duration:</span>
                    </div>
                    <span className="font-extrabold text-brand-400 text-sm">
                      {calculatedDays} Day(s)
                    </span>
                  </div>

                  {/* Team Absences Warning Badge */}
                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-indigo-300 font-bold">
                      <span className="flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span>Colleagues On Leave During Selected Dates</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-extrabold">
                        {teamAbsences.length}
                      </span>
                    </div>

                    {teamAbsences.length > 0 ? (
                      <ul className="text-slate-300 space-y-1 pt-1.5 pl-5 list-disc text-[11px]">
                        {teamAbsences.map((a) => (
                          <li key={a.id}>
                            <strong>{a.employeeName}</strong> ({a.department}) - {a.days} day(s)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-indigo-300/80 pt-1">
                        No conflicting team absences on these dates!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Reason Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Reason for Absence
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for leave..."
                  className="w-full glass-input p-3 rounded-xl text-xs"
                />
              </div>

              {/* Action Buttons (Submit & Cancel matching screenshot) */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <Link
                  href="/dashboard"
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting || uploadingFile}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Team Absences Drawer Modal */}
      {showTeamAbsencesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowTeamAbsencesModal(false)}
              className="absolute right-5 top-5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-brand-400" />
                <span>Show Team Absences</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Overview of current and upcoming approved team leaves across departments
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {teamAbsences.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs glass-card rounded-2xl">
                  Select date range on calendar to view specific team member absences.
                </div>
              ) : (
                teamAbsences.map((abs) => (
                  <div
                    key={abs.id}
                    className="p-4 rounded-2xl glass-card border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-white text-sm">{abs.employeeName}</h5>
                      <p className="text-xs text-slate-400">{abs.department}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                        {abs.days} day(s) leave
                      </span>
                    </div>
                  </div>
                ))
              )}
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
