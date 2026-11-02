import React from 'react';
import { SummaryKPIs } from '../types/sales';
import { formatCurrency, formatNumber } from '../utils/analytics';
import { DollarSign, ShoppingBag, CreditCard, Award, TrendingUp } from 'lucide-react';

interface KPICardsProps {
  kpis: SummaryKPIs;
  totalFilteredCount: number;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Gross Revenue */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">{kpis.primaryMetricLabel || 'Gross Sales'}</span>
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-slate-100">
            {formatCurrency(kpis.totalRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Real-time sync</span>
            <span aria-hidden="true">·</span>
            <span>{kpis.uniqueOrders} orders</span>
          </div>
        </div>
      </div>

      {/* Units & Order Volume */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Total Units Sold</span>
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <ShoppingBag className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-slate-100">
            {formatNumber(kpis.totalUnits)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>AOV:</span>
            <span className="font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-300">
              {formatCurrency(kpis.averageOrderValue)}
            </span>
            <span aria-hidden="true">·</span>
            <span>Avg / order</span>
          </div>
        </div>
      </div>

      {/* Top Product */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Top Revenue Product</span>
          <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-100" title={kpis.topProduct.name}>
            {kpis.topProduct.name}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-semibold tabular-nums text-slate-800 dark:text-slate-200">
              {formatCurrency(kpis.topProduct.revenue)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{kpis.topProduct.units} units</span>
          </div>
        </div>
      </div>

      {/* Dominant Payment Method */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Primary Payment Channel</span>
          <div className="rounded-lg bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {kpis.dominantPaymentMethod.name}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-semibold tabular-nums text-slate-800 dark:text-slate-200">
              {kpis.dominantPaymentMethod.sharePercent.toFixed(1)}% share
            </span>
            <span aria-hidden="true">·</span>
            <span>{kpis.dominantPaymentMethod.count} orders</span>
          </div>
        </div>
      </div>
    </div>
  );
};
