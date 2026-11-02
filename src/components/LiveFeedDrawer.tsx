import React from 'react';
import { SaleRecord } from '../types/sales';
import { formatCurrency } from '../utils/analytics';
import { 
  Play, 
  Pause, 
  FastForward, 
  Sparkles, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface LiveFeedDrawerProps {
  isStreaming: boolean;
  onToggleStreaming: () => void;
  streamIntervalMs: number;
  onChangeInterval: (ms: number) => void;
  onSimulateOrder: () => void;
  onResetData: () => void;
  recentRealtimeOrders: SaleRecord[];
  isModified: boolean;
}

export const LiveFeedDrawer: React.FC<LiveFeedDrawerProps> = ({
  isStreaming,
  onToggleStreaming,
  streamIntervalMs,
  onChangeInterval,
  onSimulateOrder,
  onResetData,
  recentRealtimeOrders,
  isModified,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Real-Time Streaming Engine
              </h3>
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                {isStreaming ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    Live active
                  </span>
                ) : (
                  <span className="text-slate-400">Paused</span>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live orders continuously stream into the dataset, instantly triggering reactive chart re-renders
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Interval selector */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-xs dark:bg-slate-800">
            <button
              type="button"
              onClick={() => onChangeInterval(3000)}
              className={`rounded-md px-2 py-1 font-medium transition-colors cursor-pointer whitespace-nowrap ${
                streamIntervalMs === 3000
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              3s (Fast)
            </button>
            <button
              type="button"
              onClick={() => onChangeInterval(6000)}
              className={`rounded-md px-2 py-1 font-medium transition-colors cursor-pointer whitespace-nowrap ${
                streamIntervalMs === 6000
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              6s (Normal)
            </button>
            <button
              type="button"
              onClick={() => onChangeInterval(10000)}
              className={`rounded-md px-2 py-1 font-medium transition-colors cursor-pointer whitespace-nowrap ${
                streamIntervalMs === 10000
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              10s (Slow)
            </button>
          </div>

          {/* Toggle Stream */}
          <button
            type="button"
            onClick={onToggleStreaming}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap ${
              isStreaming
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Start Stream</span>
              </>
            )}
          </button>

          {/* Simulate 1 Order */}
          <button
            type="button"
            onClick={onSimulateOrder}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <FastForward className="h-3.5 w-3.5 text-indigo-500" />
            <span>+1 Sale Now</span>
          </button>

          {/* Reset original data */}
          {isModified && (
            <button
              type="button"
              onClick={onResetData}
              className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-900/40 transition-colors cursor-pointer whitespace-nowrap"
              title="Restore pristine CSV initial dataset"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset to CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Order Stream Feed */}
      <div className="mt-3">
        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
          Latest Incoming Real-Time Transactions ({recentRealtimeOrders.length} captured)
        </div>

        {recentRealtimeOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
            Click &quot;Start Stream&quot; or &quot;+1 Sale Now&quot; to inject real-time transactions into the dashboard
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {recentRealtimeOrders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/40 p-2.5 text-xs dark:border-indigo-900/30 dark:bg-indigo-950/20"
              >
                <div className="truncate pr-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">· {order.paymentMethod}</span>
                  </div>
                  <div className="truncate text-slate-600 dark:text-slate-300 mt-0.5" title={order.product}>
                    {order.product}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(order.price)}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    +Live
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
