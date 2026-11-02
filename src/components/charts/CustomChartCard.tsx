import React, { useState } from 'react';
import { 
  WidgetConfig, 
  SaleRecord, 
  ChartType, 
  DimensionType, 
  MetricType, 
  ColorTheme,
  SortOption 
} from '../../types/sales';
import { aggregateSalesData } from '../../utils/analytics';
import { BarChart } from './BarChart';
import { HorizontalBarChart } from './HorizontalBarChart';
import { PieChart } from './PieChart';
import { LineChart } from './LineChart';
import { MatrixChart } from './MatrixChart';
import { RadarChart } from './RadarChart';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  LineChart as LineIcon, 
  SlidersHorizontal, 
  Trash2, 
  Layers, 
  Maximize2, 
  Minimize2,
  Grid
} from 'lucide-react';

interface CustomChartCardProps {
  widget: WidgetConfig;
  records: SaleRecord[];
  onUpdateWidget: (updated: WidgetConfig) => void;
  onRemoveWidget: (id: string) => void;
  datasetInfo?: {
    columns: { key: string; label: string; type: 'string' | 'number' | 'date' }[];
  };
}

export const CustomChartCard: React.FC<CustomChartCardProps> = ({
  widget,
  records,
  onUpdateWidget,
  onRemoveWidget,
  datasetInfo,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Compute aggregated data
  const aggregatedData = aggregateSalesData(
    records,
    widget.dimension,
    widget.metric,
    widget.sortBy,
    widget.topN,
    widget.colorTheme
  );

  const getMetricLabel = () => {
    if (widget.metric === 'revenue') return 'Gross Revenue';
    if (widget.metric === 'units') return 'Units Sold';
    return 'Avg Order Value';
  };

  const renderChart = () => {
    switch (widget.type) {
      case 'bar':
        return <BarChart data={aggregatedData} metricLabel={getMetricLabel()} />;
      case 'horizontal-bar':
        return <HorizontalBarChart data={aggregatedData} metricLabel={getMetricLabel()} />;
      case 'pie':
        return <PieChart data={aggregatedData} metricLabel={getMetricLabel()} isDonut={false} />;
      case 'donut':
        return <PieChart data={aggregatedData} metricLabel={getMetricLabel()} isDonut={true} />;
      case 'line':
        return <LineChart data={aggregatedData} metricLabel={getMetricLabel()} isArea={false} />;
      case 'area':
        return <LineChart data={aggregatedData} metricLabel={getMetricLabel()} isArea={true} />;
      case 'matrix':
        return <MatrixChart records={records} />;
      case 'radar':
        return <RadarChart data={aggregatedData} metricLabel={getMetricLabel()} />;
      default:
        return <BarChart data={aggregatedData} metricLabel={getMetricLabel()} />;
    }
  };

  const chartTypeIcons: { type: ChartType; label: string; icon: React.ReactNode }[] = [
    { type: 'bar', label: 'Bar', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { type: 'horizontal-bar', label: 'H-Bar', icon: <SlidersHorizontal className="h-3.5 w-3.5" /> },
    { type: 'pie', label: 'Pie', icon: <PieIcon className="h-3.5 w-3.5" /> },
    { type: 'donut', label: 'Donut', icon: <Layers className="h-3.5 w-3.5" /> },
    { type: 'line', label: 'Line', icon: <LineIcon className="h-3.5 w-3.5" /> },
    { type: 'area', label: 'Area', icon: <LineIcon className="h-3.5 w-3.5" /> },
    { type: 'matrix', label: 'Matrix', icon: <Grid className="h-3.5 w-3.5" /> },
  ];

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 ${
        widget.span === 'full' || isMaximized ? 'col-span-1 md:col-span-2' : 'col-span-1'
      } ${
        isMaximized
          ? 'fixed inset-4 z-50 flex flex-col p-6 shadow-2xl overflow-y-auto max-w-5xl mx-auto'
          : 'p-5 shadow-xs'
      }`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {widget.title}
            </h3>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {aggregatedData.length} entries
            </span>
          </div>
          {widget.description && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {widget.description}
            </p>
          )}
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Chart Type Buttons */}
          <div className="hidden sm:flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
            {chartTypeIcons.slice(0, 5).map(item => (
              <button
                key={item.type}
                type="button"
                onClick={() => onUpdateWidget({ ...widget, type: item.type })}
                title={`Switch to ${item.label}`}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  widget.type === item.type
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Customize Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              isConfigOpen
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>Customize</span>
          </button>

          {/* Maximize */}
          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={isMaximized ? 'Minimize' : 'Full Screen'}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Remove Widget */}
          <button
            type="button"
            onClick={() => onRemoveWidget(widget.id)}
            className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors cursor-pointer"
            title="Remove Widget"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Inline Configuration Drawer */}
      {isConfigOpen && (
        <div className="my-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/40">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {/* Chart Type Selector */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Chart Type
              </label>
              <select
                value={widget.type}
                onChange={e => onUpdateWidget({ ...widget, type: e.target.value as ChartType })}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="bar">Bar (Vertical Columns)</option>
                <option value="horizontal-bar">Horizontal Bar (Ranked)</option>
                <option value="pie">Pie Chart</option>
                <option value="donut">Donut Chart</option>
                <option value="line">Line Trend</option>
                <option value="area">Area Trend</option>
                <option value="matrix">Matrix Heatmap (Product × Payment)</option>
                <option value="radar">Radar Chart</option>
              </select>
            </div>

            {/* Dimension */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Group By (Dimension)
              </label>
              <select
                value={widget.dimension}
                onChange={e => onUpdateWidget({ ...widget, dimension: e.target.value as DimensionType })}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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

            {/* Metric */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Metric Aggregation
              </label>
              <select
                value={widget.metric}
                onChange={e => onUpdateWidget({ ...widget, metric: e.target.value as MetricType })}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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

            {/* Color Theme & Span */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Color Palette & Width
              </label>
              <div className="flex gap-2">
                <select
                  value={widget.colorTheme}
                  onChange={e => onUpdateWidget({ ...widget, colorTheme: e.target.value as ColorTheme })}
                  className="w-1/2 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="indigo">Indigo</option>
                  <option value="emerald">Emerald</option>
                  <option value="amber">Amber</option>
                  <option value="rose">Rose</option>
                  <option value="ocean">Ocean</option>
                  <option value="monochrome">Slate</option>
                </select>
                <select
                  value={widget.span}
                  onChange={e => onUpdateWidget({ ...widget, span: e.target.value as 'half' | 'full' })}
                  className="w-1/2 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="half">Half Width</option>
                  <option value="full">Full Width</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart Content */}
      <div className="mt-4 min-h-[250px] flex items-center justify-center w-full">
        {renderChart()}
      </div>
    </div>
  );
};
