import React, { useState } from 'react';
import { AggregatedDataPoint } from '../../types/sales';
import { formatCompactCurrency } from '../../utils/analytics';

interface BarChartProps {
  data: AggregatedDataPoint[];
  metricLabel: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, metricLabel }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        No records match the current filter selection
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 220;
  const paddingBottom = 45;
  const paddingTop = 25;
  const availableHeight = chartHeight - paddingBottom - paddingTop;

  // Generate 4 horizontal gridlines
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
    ratio,
    val: maxValue * ratio,
  }));

  return (
    <div className="relative w-full select-none">
      <div className="h-64 w-full">
        <svg 
          viewBox={`0 0 500 ${chartHeight}`} 
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const y = chartHeight - paddingBottom - tick.ratio * availableHeight;
            return (
              <g key={i}>
                <line
                  x1="45"
                  y1={y}
                  x2="495"
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray={i === 0 ? 'none' : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x="40"
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono tabular-nums dark:fill-slate-500"
                >
                  {formatCompactCurrency(tick.val)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, idx) => {
            const slotWidth = (450) / data.length;
            const barWidth = Math.max(12, Math.min(36, slotWidth * 0.65));
            const x = 50 + idx * slotWidth + (slotWidth - barWidth) / 2;
            const barHeight = Math.max(4, (item.value / maxValue) * availableHeight);
            const y = chartHeight - paddingBottom - barHeight;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={item.label}
                className="cursor-pointer transition-opacity duration-150"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Background hover bar column */}
                <rect
                  x={50 + idx * slotWidth}
                  y={paddingTop}
                  width={slotWidth}
                  height={availableHeight + 5}
                  fill="currentColor"
                  className={`transition-colors ${isHovered ? 'text-slate-500/10 dark:text-slate-400/10' : 'text-transparent'}`}
                  rx="4"
                />

                {/* Main Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={item.color || '#4F46E5'}
                  className={`transition-all duration-200 ${
                    hoveredIdx !== null && !isHovered ? 'opacity-40' : 'opacity-100'
                  }`}
                  style={{
                    filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                  }}
                />

                {/* Value on top of bar if active or enough room */}
                {isHovered && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    className="fill-slate-800 text-[11px] font-semibold font-mono tabular-nums dark:fill-slate-100"
                  >
                    {item.formattedValue}
                  </text>
                )}

                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className="fill-slate-600 text-[10px] font-medium dark:fill-slate-400"
                  style={{ maxWidth: slotWidth }}
                >
                  {item.label.length > 12 ? `${item.label.slice(0, 10)}…` : item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Tooltip Card */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div 
          className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95"
        >
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {data[hoveredIdx].label}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>{metricLabel}:</span>
            <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {data[hoveredIdx].formattedValue}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {data[hoveredIdx].percentage.toFixed(1)}% of total
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
