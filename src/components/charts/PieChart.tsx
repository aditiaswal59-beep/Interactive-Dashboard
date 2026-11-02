import React, { useState } from 'react';
import { AggregatedDataPoint } from '../../types/sales';

interface PieChartProps {
  data: AggregatedDataPoint[];
  metricLabel: string;
  isDonut?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ data, metricLabel, isDonut = false }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        No records match the current filter selection
      </div>
    );
  }

  const totalValue = data.reduce((acc, d) => acc + d.value, 0);
  if (totalValue <= 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Total value is zero
      </div>
    );
  }

  const size = 220;
  const center = size / 2;
  const outerRadius = 88;
  const innerRadius = isDonut ? 56 : 0;

  // Calculate slice angles
  let cumulativeAngle = -Math.PI / 2; // Start from top 12 o'clock

  const slices = data.map((item, idx) => {
    const sliceAngle = (item.value / totalValue) * (Math.PI * 2);
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;

    const isHovered = hoveredIdx === idx;
    const currentOuterRadius = isHovered ? outerRadius + 5 : outerRadius;

    // Outer arc coordinates
    const x1 = center + currentOuterRadius * Math.cos(startAngle);
    const y1 = center + currentOuterRadius * Math.sin(startAngle);
    const x2 = center + currentOuterRadius * Math.cos(endAngle);
    const y2 = center + currentOuterRadius * Math.sin(endAngle);

    // Large arc flag
    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    let path = '';
    if (innerRadius > 0) {
      // Donut slice
      const ix1 = center + innerRadius * Math.cos(startAngle);
      const iy1 = center + innerRadius * Math.sin(startAngle);
      const ix2 = center + innerRadius * Math.cos(endAngle);
      const iy2 = center + innerRadius * Math.sin(endAngle);

      path = `
        M ${x1} ${y1}
        A ${currentOuterRadius} ${currentOuterRadius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${ix2} ${iy2}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}
        Z
      `;
    } else {
      // Standard pie slice
      path = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${currentOuterRadius} ${currentOuterRadius} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `;
    }

    return {
      item,
      path,
      idx,
      isHovered,
    };
  });

  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 py-2">
      {/* SVG Container with Perfectly Centered Donut Label */}
      <div className="relative flex shrink-0 items-center justify-center w-[220px] h-[220px]">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          {slices.map(({ item, path, idx, isHovered }) => (
            <path
              key={item.label}
              d={path}
              fill={item.color || '#4F46E5'}
              className="cursor-pointer transition-all duration-200 stroke-white dark:stroke-slate-900"
              strokeWidth="1.5"
              style={{
                opacity: hoveredIdx !== null && !isHovered ? 0.45 : 1,
                filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' : 'none',
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Center Donut Label strictly aligned to the dead-center via inset-0 */}
        {isDonut && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-3 select-none">
            {activeItem ? (
              <>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[95px] uppercase tracking-wider">
                  {activeItem.label.split(' (')[0]}
                </span>
                <span className="font-mono text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {activeItem.percentage.toFixed(1)}%
                </span>
                <span className="font-mono text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                  {activeItem.formattedValue}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Total
                </span>
                <span className="font-mono text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {metricLabel.includes('Revenue') ? `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `${totalValue} units`}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {data.length} segments
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Legend & Breakdown nicely aligned on the right */}
      <div className="flex w-full flex-1 flex-col justify-center gap-1.5 overflow-y-auto max-h-56 pr-1">
        {data.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <button
              key={item.label}
              type="button"
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                isHovered
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate font-medium text-slate-700 dark:text-slate-300" title={item.label}>
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs tabular-nums">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {item.formattedValue}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
