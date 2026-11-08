import React from 'react';
import { AppointmentStatus, PaymentStatus, SalaryStatus } from '../../types';

interface BadgeProps {
  status: AppointmentStatus | PaymentStatus | SalaryStatus | 'Active' | 'Inactive' | 'On Leave' | 'Present' | 'Absent' | string;
  type?: 'appointment' | 'payment' | 'salary' | 'general';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const getStyle = (): { dot: string; text: string; bg: string; border: string } => {
    switch (status) {
      // Positive states
      case 'Confirmed':
      case 'Completed':
      case 'Paid':
      case 'Active':
      case 'Present':
      case 'Approved':
        return {
          dot: 'bg-emerald-600',
          text: 'text-emerald-800 dark:text-emerald-300',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800'
        };

      // In-progress / Checked-in
      case 'Checked In':
        return {
          dot: 'bg-teal-600 animate-pulse',
          text: 'text-teal-800 dark:text-teal-300',
          bg: 'bg-teal-50 dark:bg-teal-950/40',
          border: 'border-teal-200 dark:border-teal-800'
        };

      // Warning / Attention required
      case 'Pending':
      case 'Pending Verification':
      case 'Partially Paid':
      case 'Draft':
      case 'Half Day':
        return {
          dot: 'bg-amber-600',
          text: 'text-amber-800 dark:text-amber-300',
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800'
        };

      // Negative / Danger
      case 'Cancelled':
      case 'Rejected':
      case 'No Show':
      case 'Absent':
      case 'Terminated':
        return {
          dot: 'bg-rose-600',
          text: 'text-rose-800 dark:text-rose-300',
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800'
        };

      // Neutral / Inactive
      case 'Unpaid':
      case 'On Hold':
      case 'On Leave':
      case 'Inactive':
      default:
        return {
          dot: 'bg-slate-500',
          text: 'text-slate-700 dark:text-slate-300',
          bg: 'bg-slate-100 dark:bg-slate-800',
          border: 'border-slate-200 dark:border-slate-700'
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${style.bg} ${style.border} ${style.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
};
