import React, { useState } from 'react';
import { AggregatedDataPoint } from '../../types/sales';

interface HorizontalBarChartProps {
  data: AggregatedDataPoint[];
  metricLabel: string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, metricLabel }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        No records match the current filter selection
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full space-y-3 py-1">
      {data.map((item, idx) => {
        const percentWidth = Math.max(2, (item.value / maxValue) * 100);
        const isHovered = hoveredIdx === idx;

        return (
          <div
            key={item.label}
            className={`group rounded-lg p-1.5 transition-colors ${
              isHovered ? 'bg-slate-100/70 dark:bg-slate-800/60' : ''
            }`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-200 truncate pr-2 max-w-[220px]" title={item.label}>
                {item.label}
              </span>
              <div className="flex items-center gap-2 shrink-0 text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {item.formattedValue}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="font-mono tabular-nums text-[11px] text-slate-500">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${percentWidth}%`,
                  backgroundColor: item.color || '#4F46E5',
                  filter: isHovered ? 'brightness(1.1)' : 'none',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
