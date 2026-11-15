import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getColors = (s: string) => {
    switch (s.toUpperCase()) {
      case 'NEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ASSIGNED':
      case 'CONTACTED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'DOCUMENTS_PENDING':
      case 'PENDING':
      case 'PENDING_ADMIN':
      case 'PENDING_CEO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DOCUMENTS_RECEIVED':
      case 'APPLICATION_SUBMITTED':
      case 'UNDER_PROCESS':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'SANCTIONED':
      case 'SUCCESSFUL':
      case 'APPROVED':
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PARTIALLY_DISBURSED':
      case 'PARTIALLY_RELEASED':
      case 'PARTIALLY_PAID':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'FULLY_DISBURSED':
      case 'RELEASED':
      case 'CLOSED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'REJECTED':
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'REVERSED':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatText = (s: string) => {
    return s.replace(/_/g, ' ');
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClasses} ${getColors(status)}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {formatText(status)}
    </span>
  );
};
