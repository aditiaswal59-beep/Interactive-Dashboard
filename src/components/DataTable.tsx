import React, { useState } from 'react';
import { GenericRecord, DatasetInfo } from '../types/sales';
import { formatCurrency, formatNumber, exportToCSV } from '../utils/analytics';
import { 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Trash2,
  Sparkles
} from 'lucide-react';

interface DataTableProps {
  records: GenericRecord[];
  onDeleteRecord: (id: string) => void;
  datasetInfo?: DatasetInfo;
}

export const DataTable: React.FC<DataTableProps> = ({ records, onDeleteRecord, datasetInfo }) => {
  const [sortField, setSortField] = useState<string>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Active columns to display
  const columns = datasetInfo?.columns || [
    { key: 'orderNumber', label: 'Order Number', type: 'string' as const },
    { key: 'product', label: 'Product', type: 'string' as const },
    { key: 'price', label: 'Price', type: 'number' as const },
    { key: 'date', label: 'Date', type: 'date' as const },
    { key: 'paymentMethod', label: 'Payment Method', type: 'string' as const },
  ];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Sort records
  const sortedRecords = [...records].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (valA === undefined && valB === undefined) return 0;
    if (valA === undefined) return 1;
    if (valB === undefined) return -1;

    let comparison = 0;
    if (typeof valA === 'number' && typeof valB === 'number') {
      comparison = valA - valB;
    } else {
      comparison = String(valA).localeCompare(String(valB));
    }
    return sortAsc ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const currentRows = sortedRecords.slice(startIndex, startIndex + pageSize);

  const formatCellValue = (val: any, col: { key: string; label: string; type: string }) => {
    if (val === undefined || val === null || val === '') return '-';
    if (col.type === 'number') {
      const num = Number(val);
      if (isNaN(num)) return String(val);
      if (col.key.toLowerCase().includes('price') || col.key.toLowerCase().includes('mrr') || col.key.toLowerCase().includes('revenue') || col.key.toLowerCase().includes('cost')) {
        return formatCurrency(num);
      }
      return formatNumber(num);
    }
    return String(val);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Table Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {datasetInfo?.name || 'Transaction Ledger'}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Comprehensive table view ({records.length} total rows)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportToCSV(records, `${datasetInfo?.name.replace(/\s+/g, '_') || 'Sales_Data'}.csv`)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Viewport */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`py-2.5 px-3 font-semibold ${col.type === 'number' ? 'text-right' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    className={`flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer ${
                      col.type === 'number' ? 'ml-auto' : ''
                    }`}
                  >
                    <span>{col.label}</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              ))}
              <th className="py-2.5 px-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-8 text-center text-slate-500">
                  No records match current filter
                </td>
              </tr>
            ) : (
              currentRows.map(row => (
                <tr
                  key={row.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                    row.isRealtimeAddition ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  {columns.map((col, idx) => (
                    <td
                      key={col.key}
                      className={`py-2.5 px-3 ${
                        col.type === 'number'
                          ? 'text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100'
                          : col.type === 'date'
                          ? 'font-mono text-slate-600 dark:text-slate-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {idx === 0 && row.isRealtimeAddition ? (
                        <div className="flex items-center gap-1.5 font-mono font-medium text-slate-900 dark:text-slate-100">
                          <span title="Real-time addition">
                            <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
                          </span>
                          <span>{formatCellValue(row[col.key], col)}</span>
                        </div>
                      ) : (
                        formatCellValue(row[col.key], col)
                      )}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(row.id)}
                      className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="ml-2 font-mono tabular-nums">
            {records.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + pageSize, records.length)} of {records.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 font-mono tabular-nums">
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
