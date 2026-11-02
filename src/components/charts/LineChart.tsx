import React, { useState } from 'react';
import { AggregatedDataPoint } from '../../types/sales';
import { formatCompactCurrency } from '../../utils/analytics';

interface LineChartProps {
  data: AggregatedDataPoint[];
  metricLabel: string;
  isArea?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({ data, metricLabel, isArea = false }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        No records match the current filter selection
      </div>
    );
  }

  const values = data.map(d => d.value);
  const maxValue = Math.max(...values, 1);
  const minValue = 0; // Baseline at 0 for honest sales visualization

  const chartWidth = 600;
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(1, data.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((d.value - minValue) / (maxValue - minValue)) * innerHeight;
    return { x, y, data: d };
  });

  // Build SVG path
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Area path (closed to bottom)
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z`
    : '';

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(r => ({
    ratio: r,
    val: maxValue * r,
  }));

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="relative w-full select-none">
      <div className="h-64 w-full">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const y = paddingTop + innerHeight - tick.ratio * innerHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray={i === 0 ? 'none' : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono tabular-nums dark:fill-slate-500"
                >
                  {formatCompactCurrency(tick.val)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {isArea && (
            <path
              d={areaD}
              fill="url(#areaGradient)"
              className="transition-all duration-300"
            />
          )}

          {/* Main Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover tracker cursor line */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={paddingTop}
              x2={hoveredPoint.x}
              y2={paddingTop + innerHeight}
              stroke="currentColor"
              className="text-slate-400 dark:text-slate-500"
              strokeDasharray="2 2"
              strokeWidth="1.5"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
            >
              {/* Invisible touch/hover target */}
              <circle
                cx={p.x}
                cy={p.y}
                r="12"
                fill="transparent"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? '5' : '3'}
                className="fill-white stroke-[#0EA5E9] dark:fill-slate-900 transition-all duration-150"
                strokeWidth={hoveredIdx === idx ? '2.5' : '1.5'}
              />
            </g>
          ))}

          {/* X Axis Ticks (sample 6 ticks to prevent crowding) */}
          {points.length > 0 && (
            <>
              {points
                .filter((_, idx) => {
                  if (points.length <= 8) return true;
                  const step = Math.ceil(points.length / 6);
                  return idx % step === 0 || idx === points.length - 1;
                })
                .map((p, i) => (
                  <text
                    key={i}
                    x={p.x}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] font-mono tabular-nums dark:fill-slate-400"
                  >
                    {p.data.label.replace('2025-', '')}
                  </text>
                ))}
            </>
          )}
        </svg>
      </div>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          className="pointer-events-none absolute -top-2 rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95"
          style={{
            left: `${Math.min(85, Math.max(15, (hoveredPoint.x / chartWidth) * 100))}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {hoveredPoint.data.label}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>{metricLabel}:</span>
            <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {hoveredPoint.data.formattedValue}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {hoveredPoint.data.count} items
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
