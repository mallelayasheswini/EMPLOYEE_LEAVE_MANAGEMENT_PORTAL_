import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateInput: string | Date): string {
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatLeaveType(type: string): string {
  switch (type) {
    case 'CASUAL':
      return 'Flexible Vacation - India';
    case 'SICK':
      return 'Sick Leave - India';
    case 'EARNED':
      return 'Earned / Annual Leave';
    case 'PARENTAL':
      return 'Primary Parental Leave';
    case 'SECONDARY_PARENTAL':
      return 'Secondary Parental Leave';
    case 'SPECIAL_MEDICAL':
      return 'Special Medical Leave - India';
    case 'MENSTRUAL':
      return 'Menstrual Leave - India';
    case 'ADOPTION':
      return 'Adoption - India';
    case 'CHARITABLE':
      return 'Charitable Works';
    case 'UNPAID':
      return 'Unpaid Leave - India';
    default:
      return type;
  }
}

export function getStatusBadgeStyle(status: string): { bg: string; text: string; border: string; label: string } {
  switch (status) {
    case 'APPROVED':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/20 dark:border-emerald-500/30',
        label: 'Approved',
      };
    case 'PENDING':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-500/20 dark:border-amber-500/30',
        label: 'Pending Review',
      };
    case 'REJECTED':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-500/20 dark:border-rose-500/30',
        label: 'Rejected',
      };
    case 'CANCELLED':
      return {
        bg: 'bg-slate-500/10 dark:bg-slate-500/20',
        text: 'text-slate-700 dark:text-slate-400',
        border: 'border-slate-500/20 dark:border-slate-500/30',
        label: 'Cancelled',
      };
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
        label: status,
      };
  }
}
