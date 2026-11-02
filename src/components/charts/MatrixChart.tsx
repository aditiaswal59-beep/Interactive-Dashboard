import React, { useState } from 'react';
import { SaleRecord } from '../../types/sales';
import { generatePaymentMatrix, formatCurrency } from '../../utils/analytics';

interface MatrixChartProps {
  records: SaleRecord[];
}

export const MatrixChart: React.FC<MatrixChartProps> = ({ records }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    product: string;
    payment: string;
    revenue: number;
    count: number;
  } | null>(null);

  const { products, paymentMethods, matrix, maxRevenue } = generatePaymentMatrix(records);

  if (products.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        No records match current filter
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto select-none py-2">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr>
            <th className="py-2 pr-4 font-semibold text-slate-500 dark:text-slate-400 min-w-[170px]">
              Product / Payment
            </th>
            {paymentMethods.map(pm => (
              <th key={pm} className="py-2 px-2 text-center font-semibold text-slate-700 dark:text-slate-300 min-w-[90px]">
                {pm}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {products.map(p => (
            <tr key={p} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[190px]" title={p}>
                {p}
              </td>
              {paymentMethods.map(pm => {
                const cell = matrix[p]?.[pm] || { revenue: 0, count: 0 };
                const intensity = Math.min(1, cell.revenue / maxRevenue);
                const isHovered = hoveredCell?.product === p && hoveredCell?.payment === pm;

                return (
                  <td key={pm} className="p-1 text-center">
                    <button
                      type="button"
                      onMouseEnter={() => setHoveredCell({ product: p, payment: pm, ...cell })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-full rounded py-1.5 px-1 font-mono tabular-nums text-[11px] transition-all cursor-pointer ${
                        isHovered ? 'ring-2 ring-indigo-500 z-10' : ''
                      }`}
                      style={{
                        backgroundColor: cell.count > 0 
                          ? `rgba(99, 102, 241, ${Math.max(0.12, intensity * 0.85)})`
                          : 'transparent',
                        color: intensity > 0.45 ? '#FFFFFF' : 'inherit',
                      }}
                    >
                      {cell.count > 0 ? (
                        <div>
                          <div className="font-semibold">{formatCurrency(cell.revenue)}</div>
                          <div className="text-[9px] opacity-75">{cell.count} orders</div>
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">-</span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {hoveredCell && hoveredCell.count > 0 && (
        <div className="pointer-events-none mt-2 flex items-center justify-between rounded-md border border-slate-200 bg-white/95 px-3 py-1.5 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
          <div className="text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{hoveredCell.product}</span> via{' '}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{hoveredCell.payment}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {formatCurrency(hoveredCell.revenue)}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-mono tabular-nums text-slate-500">
              {hoveredCell.count} line items
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
