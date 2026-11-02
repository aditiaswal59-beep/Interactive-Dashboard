import React, { useState } from 'react';
import { FilterState, PaymentMethod } from '../types/sales';
import { PAYMENT_METHODS, PRODUCT_CATALOG } from '../data/initialData';
import { Search, X, Filter, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  totalResults: number;
  totalDatasetCount: number;
  datasetInfo?: { name: string; isCustom?: boolean };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  totalDatasetCount,
  datasetInfo,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const togglePaymentMethod = (pm: PaymentMethod) => {
    const current = filters.selectedPaymentMethods;
    const exists = current.includes(pm);
    const updated = exists ? current.filter(item => item !== pm) : [...current, pm];
    onFilterChange({ ...filters, selectedPaymentMethods: updated });
  };

  const handleDatePreset = (preset: 'all' | 'aug' | 'sep' | 'oct') => {
    if (preset === 'all') {
      onFilterChange({ ...filters, startDate: '', endDate: '' });
    } else if (preset === 'aug') {
      onFilterChange({ ...filters, startDate: '2025-08-01', endDate: '2025-08-31' });
    } else if (preset === 'sep') {
      onFilterChange({ ...filters, startDate: '2025-09-01', endDate: '2025-09-30' });
    } else if (preset === 'oct') {
      onFilterChange({ ...filters, startDate: '2025-10-01', endDate: '2025-10-31' });
    }
  };

  const hasActiveFilters = 
    Boolean(filters.searchQuery) ||
    filters.selectedPaymentMethods.length > 0 ||
    filters.selectedProducts.length > 0 ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate) ||
    filters.minPrice > 0 ||
    filters.maxPrice < 200;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Top Search & Primary Filters Row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search across any field (ID, product, tier, channel)..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-400"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Date presets and Quick Payment chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Presets */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => handleDatePreset('all')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                !filters.startDate && !filters.endDate
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => handleDatePreset('aug')}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filters.startDate === '2025-08-01'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              Aug 2025
            </button>
            <button
              type="button"
              onClick={() => handleDatePreset('sep')}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filters.startDate === '2025-09-01'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              Sep 2025
            </button>
            <button
              type="button"
              onClick={() => handleDatePreset('oct')}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filters.startDate === '2025-10-01'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              Oct 2025
            </button>
          </div>

          {/* More Filters Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              isExpanded || hasActiveFilters
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Refine Filters</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer ml-1 whitespace-nowrap"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Payment Methods */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Payment Method
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map(pm => {
                const isSelected = filters.selectedPaymentMethods.includes(pm);
                return (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => togglePaymentMethod(pm)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pm}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Filter by Product
            </label>
            <select
              value={filters.selectedProducts[0] || ''}
              onChange={e => {
                const val = e.target.value;
                onFilterChange({
                  ...filters,
                  selectedProducts: val ? [val] : [],
                });
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">All Apparel Products (12 items)</option>
              {PRODUCT_CATALOG.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name} (${p.standardPrice.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Bounds */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Custom Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={e => onFilterChange({ ...filters, startDate: e.target.value })}
                className="w-1/2 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-mono"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => onFilterChange({ ...filters, endDate: e.target.value })}
                className="w-1/2 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Results Status */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span>Showing:</span>
          <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {totalResults}
          </span>
          <span>of</span>
          <span className="font-mono tabular-nums">{totalDatasetCount} records</span>
          {hasActiveFilters && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-600 dark:text-indigo-400">Filtered view</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
