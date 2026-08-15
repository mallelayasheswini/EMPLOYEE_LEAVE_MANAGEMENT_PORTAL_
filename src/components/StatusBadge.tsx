import React from 'react';
import { getStatusBadgeStyle } from '@/lib/utils';
import { CheckCircle2, Clock, XCircle, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = getStatusBadgeStyle(status);

  const getIcon = () => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case 'PENDING':
        return <Clock className="w-3.5 h-3.5 mr-1 animate-pulse" />;
      case 'REJECTED':
        return <XCircle className="w-3.5 h-3.5 mr-1" />;
      case 'CANCELLED':
        return <Ban className="w-3.5 h-3.5 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
    >
      {getIcon()}
      {style.label}
    </span>
  );
}
