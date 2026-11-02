import React, { useState } from 'react';
import { AggregatedDataPoint } from '../../types/sales';

interface RadarChartProps {
  data: AggregatedDataPoint[];
  metricLabel: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, metricLabel }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length < 3) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Radar chart requires at least 3 categories
      </div>
    );
  }

  const size = 260;
  const center = size / 2;
  const radius = 90;
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const totalSides = data.length;

  // Grid levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1];

  // Calculate polygon points for data
  const dataPoints = data.map((d, i) => {
    const angle = (Math.PI * 2 / totalSides) * i - Math.PI / 2;
    const r = (d.value / maxValue) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, data: d, angle };
  });

  const polygonPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center justify-center py-2 select-none">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {/* Concentric grid polygons */}
          {levels.map((lvl, lIdx) => {
            const gridPts = data.map((_, i) => {
              const angle = (Math.PI * 2 / totalSides) * i - Math.PI / 2;
              const r = radius * lvl;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') + ' Z';

            return (
              <path
                key={lIdx}
                d={gridPts}
                fill="none"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="1"
              />
            );
          })}

          {/* Radial axis lines */}
          {data.map((_, i) => {
            const angle = (Math.PI * 2 / totalSides) * i - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled polygon */}
          <path
            d={polygonPath}
            fill="#4F46E5"
            fillOpacity="0.25"
            stroke="#4F46E5"
            strokeWidth="2"
            className="transition-all duration-200"
          />

          {/* Points & Labels */}
          {dataPoints.map((p, idx) => {
            const labelX = center + (radius + 18) * Math.cos(p.angle);
            const labelY = center + (radius + 18) * Math.sin(p.angle);
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={p.data.label}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  className="fill-indigo-600 stroke-white dark:stroke-slate-900 transition-all duration-150"
                  strokeWidth="2"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-[10px] font-medium transition-colors ${
                    isHovered
                      ? 'fill-indigo-600 font-bold dark:fill-indigo-400'
                      : 'fill-slate-600 dark:fill-slate-400'
                  }`}
                >
                  {p.data.label.length > 10 ? `${p.data.label.slice(0, 9)}…` : p.data.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredIdx !== null && dataPoints[hoveredIdx] && (
          <div className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-slate-200 bg-white/95 px-2.5 py-1 text-xs shadow-md dark:border-slate-800 dark:bg-slate-900/95">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {dataPoints[hoveredIdx].data.label}:
            </span>{' '}
            <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400 font-bold">
              {dataPoints[hoveredIdx].data.formattedValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
