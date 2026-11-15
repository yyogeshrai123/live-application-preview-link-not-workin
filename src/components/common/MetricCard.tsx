import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'blue',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          border: 'border-slate-200 hover:border-emerald-300',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
          border: 'border-slate-200 hover:border-amber-300',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
          border: 'border-slate-200 hover:border-purple-300',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
          border: 'border-slate-200 hover:border-rose-300',
        };
      case 'slate':
        return {
          iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
          border: 'border-slate-200 hover:border-slate-300',
        };
      case 'blue':
      default:
        return {
          iconBg: 'bg-blue-50 text-blue-700 border-blue-100',
          border: 'border-slate-200 hover:border-blue-300',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`bg-white rounded-xl p-5 border shadow-xs transition-all duration-200 ${styles.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-lg border ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span className={`font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.value}
          </span>
          <span className="text-slate-400 ml-1.5">vs previous period</span>
        </div>
      )}
    </div>
  );
};
