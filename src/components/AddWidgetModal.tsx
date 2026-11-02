import React, { useState } from 'react';
import { 
  WidgetConfig, 
  ChartType, 
  DimensionType, 
  MetricType, 
  ColorTheme, 
  SortOption 
} from '../types/sales';
import { DatasetInfo } from '../types/sales';
import { X, LayoutGrid } from 'lucide-react';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widget: WidgetConfig) => void;
  datasetInfo?: DatasetInfo;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  onAddWidget,
  datasetInfo,
}) => {
  const [title, setTitle] = useState('Custom Visualizer');
  const [type, setType] = useState<ChartType>('bar');
  const [dimension, setDimension] = useState<DimensionType>(() => datasetInfo?.primaryDimension || 'product');
  const [metric, setMetric] = useState<MetricType>(() => datasetInfo?.primaryMetric || 'revenue');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('indigo');
  const [sortBy, setSortBy] = useState<SortOption>('desc');
  const [topN, setTopN] = useState<number>(8);
  const [span, setSpan] = useState<'half' | 'full'>('half');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWidget({
      id: `widget-custom-${Date.now()}`,
      title: title.trim() || 'Custom Chart',
      type,
      dimension,
      metric,
      colorTheme,
      sortBy,
      topN,
      span,
      description: `Analyzing ${metric} by ${dimension}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Add Custom Visualization
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Design and pin an interactive chart widget to your dashboard
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Widget Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Weekly Revenue Velocity"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Chart Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as ChartType)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="bar">Bar (Vertical Column)</option>
                <option value="horizontal-bar">Horizontal Bar (Ranked)</option>
                <option value="pie">Pie Chart</option>
                <option value="donut">Donut Chart</option>
                <option value="line">Line Trend</option>
                <option value="area">Area Trend</option>
                <option value="matrix">Matrix Heatmap</option>
                <option value="radar">Radar / Polar</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Dimension (Group By)
              </label>
              <select
                value={dimension}
                onChange={e => setDimension(e.target.value as DimensionType)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {datasetInfo?.columns && datasetInfo.columns.length > 0 ? (
                  <>
                    {datasetInfo.columns.map(col => (
                      <option key={col.key} value={col.key}>
                        {col.label} ({col.type})
                      </option>
                    ))}
                    <option value="week">Week of Month</option>
                    <option value="priceTier">Value Tier</option>
                  </>
                ) : (
                  <>
                    <option value="product">Product Name</option>
                    <option value="paymentMethod">Payment Method</option>
                    <option value="date">Date (Daily)</option>
                    <option value="week">Week of Month</option>
                    <option value="priceTier">Price Tier</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Metric
              </label>
              <select
                value={metric}
                onChange={e => setMetric(e.target.value as MetricType)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {datasetInfo?.columns && datasetInfo.columns.some(c => c.type === 'number') ? (
                  <>
                    {datasetInfo.columns
                      .filter(c => c.type === 'number')
                      .map(c => (
                        <option key={c.key} value={c.key}>
                          Total {c.label} (Sum)
                        </option>
                      ))}
                    <option value="units">Record Volume (Count)</option>
                    <option value="avgOrderValue">Average Value</option>
                  </>
                ) : (
                  <>
                    <option value="revenue">Gross Revenue ($)</option>
                    <option value="units">Units Sold (Count)</option>
                    <option value="avgOrderValue">Avg Unit Price ($)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Color Palette
              </label>
              <select
                value={colorTheme}
                onChange={e => setColorTheme(e.target.value as ColorTheme)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="indigo">Indigo Slate</option>
                <option value="emerald">Emerald Forest</option>
                <option value="amber">Warm Amber</option>
                <option value="rose">Rose Wine</option>
                <option value="ocean">Ocean Azure</option>
                <option value="monochrome">Minimalist Slate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Card Width
              </label>
              <select
                value={span}
                onChange={e => setSpan(e.target.value as 'half' | 'full')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="half">Half Width (1 Column)</option>
                <option value="full">Full Width (2 Columns)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Top N Categories
              </label>
              <select
                value={topN}
                onChange={e => setTopN(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value={0}>Show All</option>
                <option value={5}>Top 5</option>
                <option value={8}>Top 8</option>
                <option value={10}>Top 10</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Add Widget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
