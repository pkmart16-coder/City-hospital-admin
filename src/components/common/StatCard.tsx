import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'navy' | 'teal' | 'emerald' | 'amber' | 'rose' | 'default';
  onClick?: () => void;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
  trend
}) => {
  const getTheme = () => {
    switch (variant) {
      case 'navy':
        return {
          iconBg: 'bg-slate-900 text-white dark:bg-slate-800',
          accent: 'border-l-4 border-l-slate-900 dark:border-l-teal-500'
        };
      case 'teal':
        return {
          iconBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
          accent: 'border-l-4 border-l-teal-600'
        };
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
          accent: 'border-l-4 border-l-emerald-600'
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
          accent: 'border-l-4 border-l-amber-500'
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
          accent: 'border-l-4 border-l-rose-500'
        };
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          accent: 'border-l-4 border-l-slate-400'
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : ''
      } ${theme.accent}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1.5 font-sans">
            {value}
          </h4>
        </div>
        <div className={`p-2.5 rounded-lg ${theme.iconBg} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          {trend && (
            <span className={`font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.value}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
