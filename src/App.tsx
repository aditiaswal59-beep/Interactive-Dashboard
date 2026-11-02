import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  GenericRecord, 
  WidgetConfig, 
  FilterState, 
  DatasetInfo 
} from './types/sales';
import { 
  INITIAL_SALES_RECORDS, 
  DEFAULT_WIDGETS, 
  PRODUCT_CATALOG, 
  PAYMENT_METHODS, 
  parseSalesCSV 
} from './data/initialData';
import { calculateSummaryKPIs } from './utils/analytics';
import { TopBar } from './components/TopBar';
import { KPICards } from './components/KPICards';
import { FilterBar } from './components/FilterBar';
import { CustomChartCard } from './components/charts/CustomChartCard';
import { DataTable } from './components/DataTable';
import { NewTransactionModal } from './components/NewTransactionModal';
import { AddWidgetModal } from './components/AddWidgetModal';
import { ImportDataModal } from './components/ImportDataModal';
import { LiveFeedDrawer } from './components/LiveFeedDrawer';
import { Plus, LayoutGrid, CheckCircle2, Upload, Database } from 'lucide-react';

const INITIAL_DATASET_INFO: DatasetInfo = {
  id: 'dataset-initial',
  name: 'Retail Apparel Sales',
  description: 'Original 116 records of menswear and trouser sales with payment channels',
  columns: [
    { key: 'orderNumber', label: 'Order Number', type: 'string' },
    { key: 'product', label: 'Product', type: 'string' },
    { key: 'price', label: 'Price ($)', type: 'number' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'paymentMethod', label: 'Payment Method', type: 'string' },
  ],
  primaryDimension: 'product',
  primaryMetric: 'price',
  primaryDateColumn: 'date',
  isCustom: false,
};

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Active dataset info
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo>(INITIAL_DATASET_INFO);

  // Main data records
  const [records, setRecords] = useState<GenericRecord[]>(INITIAL_SALES_RECORDS);
  const [recentRealtimeOrders, setRecentRealtimeOrders] = useState<GenericRecord[]>([]);
  const [orderSequence, setOrderSequence] = useState<number>(1099);

  // Load from asset path if available on first mount
  useEffect(() => {
    fetch('/assets/aistudio/Sales_data_-_Sheet1_5e94d700.csv')
      .then(res => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.text();
      })
      .then(csvText => {
        const parsed = parseSalesCSV(csvText);
        if (parsed.length > 0) {
          setRecords(parsed);
        }
      })
      .catch(() => {
        // Fallback to embedded initial sales records
      });
  }, []);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategories: {},
    startDate: '',
    endDate: '',
    minMetric: 0,
    maxMetric: 1000000,
    selectedProducts: [],
    selectedPaymentMethods: [],
    minPrice: 0,
    maxPrice: 1000000,
  });

  // Widgets state
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);

  // Active section for navigation
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Modals state
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live streaming engine
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamIntervalMs, setStreamIntervalMs] = useState(6000);

  // Show toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Switch or import any dataset
  const handleImportDataset = (newInfo: DatasetInfo, newRecords: GenericRecord[]) => {
    setDatasetInfo(newInfo);
    setRecords(newRecords);
    setRecentRealtimeOrders([]);
    setIsStreaming(false);

    // Auto-generate fresh widgets matching the imported schema
    const strCols = newInfo.columns.filter(c => c.type === 'string');
    const numCols = newInfo.columns.filter(c => c.type === 'number');
    const dateCol = newInfo.columns.find(c => c.type === 'date');

    const primaryDim = newInfo.primaryDimension || (strCols[0]?.key || 'category');
    const secondaryDim = strCols[1]?.key || primaryDim;
    const primaryMet = newInfo.primaryMetric || (numCols[0]?.key || 'value');

    const generatedWidgets: WidgetConfig[] = [
      {
        id: `widget-bar-${Date.now()}-1`,
        title: `${newInfo.columns.find(c => c.key === primaryDim)?.label || 'Primary'} Distribution`,
        type: 'bar',
        dimension: primaryDim,
        metric: primaryMet,
        colorTheme: 'indigo',
        sortBy: 'desc',
        topN: 8,
        span: 'half',
        description: `Breakdown of ${primaryMet} by ${primaryDim}`,
      },
      {
        id: `widget-pie-${Date.now()}-2`,
        title: `${newInfo.columns.find(c => c.key === secondaryDim)?.label || 'Secondary'} Share`,
        type: 'donut',
        dimension: secondaryDim,
        metric: primaryMet,
        colorTheme: 'emerald',
        sortBy: 'desc',
        topN: 6,
        span: 'half',
        description: `Share of total across ${secondaryDim}`,
      },
    ];

    if (dateCol) {
      generatedWidgets.push({
        id: `widget-trend-${Date.now()}-3`,
        title: `${newInfo.columns.find(c => c.key === dateCol.key)?.label || 'Timeline'} Trend`,
        type: 'line',
        dimension: dateCol.key,
        metric: primaryMet,
        colorTheme: 'ocean',
        sortBy: 'chrono',
        topN: 0,
        span: 'full',
        description: `Temporal trend over ${dateCol.label}`,
      });
    }

    generatedWidgets.push({
      id: `widget-hbar-${Date.now()}-4`,
      title: `Ranked ${newInfo.columns.find(c => c.key === primaryDim)?.label || 'Items'}`,
      type: 'horizontal-bar',
      dimension: primaryDim,
      metric: numCols[1]?.key || 'units',
      colorTheme: 'amber',
      sortBy: 'desc',
      topN: 6,
      span: 'half',
      description: `Comparative ranking by volume`,
    });

    setWidgets(generatedWidgets);
    triggerToast(`Loaded dataset: "${newInfo.name}" (${newRecords.length} records)`);
  };

  // Simulate a realistic incoming record
  const generateSimulatedRecord = useCallback((): GenericRecord => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // If apparel dataset, use real catalog
    if (!datasetInfo.isCustom) {
      const randomProduct = PRODUCT_CATALOG[Math.floor(Math.random() * PRODUCT_CATALOG.length)];
      const randomPayment = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
      const currentOrderNum = `TT-${orderSequence}`;
      setOrderSequence(prev => prev + 1);

      return {
        id: `rt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderNumber: currentOrderNum,
        product: randomProduct.name,
        price: randomProduct.standardPrice,
        date: dateStr,
        paymentMethod: randomPayment,
        isRealtimeAddition: true,
        createdAt: Date.now(),
      };
    }

    // Custom dataset simulation: pick random sample values from existing rows
    const randomExisting = records[Math.floor(Math.random() * Math.max(1, records.length))] || {};
    const simulated: GenericRecord = {
      id: `rt_custom_${Date.now()}`,
      isRealtimeAddition: true,
      createdAt: Date.now(),
    };

    datasetInfo.columns.forEach(col => {
      if (col.type === 'number') {
        const base = Number(randomExisting[col.key]) || 100;
        const variation = (Math.random() * 0.4 - 0.2) * base;
        simulated[col.key] = Math.max(1, Math.round((base + variation) * 100) / 100);
      } else if (col.type === 'date') {
        simulated[col.key] = dateStr;
      } else {
        simulated[col.key] = randomExisting[col.key] || 'Live Streamed Item';
      }
    });

    return simulated;
  }, [datasetInfo, orderSequence, records]);

  const handleSimulateOrder = useCallback(() => {
    const newRecord = generateSimulatedRecord();
    setRecords(prev => [newRecord, ...prev]);
    setRecentRealtimeOrders(prev => [newRecord, ...prev.slice(0, 19)]);
    const label = newRecord.orderNumber || newRecord.product || newRecord.id;
    triggerToast(`Real-time entry received: ${label}`);
  }, [generateSimulatedRecord]);

  // Real-time interval worker
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      handleSimulateOrder();
    }, streamIntervalMs);
    return () => clearInterval(interval);
  }, [isStreaming, streamIntervalMs, handleSimulateOrder]);

  // Manual new record submission
  const handleAddNewRecord = (data: Omit<GenericRecord, 'id'>) => {
    const newRecord: GenericRecord = {
      ...data,
      id: `manual_${Date.now()}`,
    };
    setRecords(prev => [newRecord, ...prev]);
    setRecentRealtimeOrders(prev => [newRecord, ...prev.slice(0, 19)]);
    setOrderSequence(prev => prev + 1);
    const identifier = newRecord.orderNumber || newRecord.product || 'New Record';
    triggerToast(`Added record "${identifier}"`);
  };

  // Delete transaction
  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    setRecentRealtimeOrders(prev => prev.filter(r => r.id !== id));
    triggerToast('Record removed');
  };

  // Reset to initial CSV dataset
  const handleResetData = () => {
    setDatasetInfo(INITIAL_DATASET_INFO);
    setRecords(INITIAL_SALES_RECORDS);
    setRecentRealtimeOrders([]);
    setIsStreaming(false);
    setOrderSequence(1099);
    setWidgets(DEFAULT_WIDGETS);
    triggerToast('Restored original Retail Apparel dataset');
  };

  // Universal Filter records across any dataset
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Universal Search query (across ALL columns)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesAnyField = Object.entries(record).some(([k, val]) => {
          if (k === 'id' || k === 'createdAt' || k === 'isRealtimeAddition') return false;
          return String(val ?? '').toLowerCase().includes(query);
        });
        if (!matchesAnyField) return false;
      }

      // Payment method (if applicable)
      if (filters.selectedPaymentMethods.length > 0 && record.paymentMethod) {
        if (!filters.selectedPaymentMethods.includes(record.paymentMethod)) {
          return false;
        }
      }

      // Product (if applicable)
      if (filters.selectedProducts.length > 0 && record.product) {
        if (!filters.selectedProducts.includes(record.product)) {
          return false;
        }
      }

      // Date range (against detected date column or 'date')
      const dateKey = datasetInfo.primaryDateColumn || 'date';
      const recordDate = record[dateKey];
      if (recordDate) {
        if (filters.startDate && recordDate < filters.startDate) return false;
        if (filters.endDate && recordDate > filters.endDate) return false;
      }

      // Price / Metric range
      const metricKey = datasetInfo.primaryMetric || 'price';
      const metricVal = Number(record[metricKey]);
      if (!isNaN(metricVal)) {
        if (metricVal < filters.minPrice) return false;
        if (filters.maxPrice < 1000000 && metricVal > filters.maxPrice) return false;
      }

      return true;
    });
  }, [records, filters, datasetInfo]);

  // Summary KPIs for current view
  const summaryKPIs = useMemo(() => {
    return calculateSummaryKPIs(filteredRecords, datasetInfo);
  }, [filteredRecords, datasetInfo]);

  // Widget management
  const handleUpdateWidget = (updated: WidgetConfig) => {
    setWidgets(prev => prev.map(w => (w.id === updated.id ? updated : w)));
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const handleAddWidget = (newWidget: WidgetConfig) => {
    setWidgets(prev => [newWidget, ...prev]);
    triggerToast(`Added custom chart: ${newWidget.title}`);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCategories: {},
      startDate: '',
      endDate: '',
      minMetric: 0,
      maxMetric: 1000000,
      selectedProducts: [],
      selectedPaymentMethods: [],
      minPrice: 0,
      maxPrice: 1000000,
    });
  };

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Bar matching Top Bar Contract */}
      <TopBar
        onOpenNewTransaction={() => setIsNewTxOpen(true)}
        onOpenImportData={() => setIsImportModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        activeSection={activeSection}
        onSelectSection={scrollToSection}
      />

      {/* Main Content Workspace */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section 1: Executive KPI Strip & Dataset Info */}
        <section id="overview" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {datasetInfo.name}
                </h1>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {datasetInfo.isCustom ? 'Custom Data' : 'Active Dataset'}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{records.length} total rows</span>
                <span aria-hidden="true">·</span>
                <span>{datasetInfo.columns.length} columns</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{filteredRecords.length} matched by filters</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Upload className="h-3.5 w-3.5 text-indigo-500" />
                <span>Upload / Switch Data</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddWidgetOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-indigo-500" />
                <span>+ Add Visualization</span>
              </button>
            </div>
          </div>

          <KPICards kpis={summaryKPIs} totalFilteredCount={filteredRecords.length} />
        </section>

        {/* Section 2: Real-Time Stream Engine Drawer */}
        <section id="stream">
          <LiveFeedDrawer
            isStreaming={isStreaming}
            onToggleStreaming={() => setIsStreaming(!isStreaming)}
            streamIntervalMs={streamIntervalMs}
            onChangeInterval={setStreamIntervalMs}
            onSimulateOrder={handleSimulateOrder}
            onResetData={handleResetData}
            recentRealtimeOrders={recentRealtimeOrders}
            isModified={records.length !== INITIAL_SALES_RECORDS.length || Boolean(datasetInfo.isCustom)}
          />
        </section>

        {/* Section 3: Universal Filter Bar */}
        <section>
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={handleResetFilters}
            totalResults={filteredRecords.length}
            totalDatasetCount={records.length}
            datasetInfo={datasetInfo}
          />
        </section>

        {/* Section 4: Customizable Visualizations Grid */}
        <section id="charts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Customizable Visualizations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch chart types (Bar, Horizontal Bar, Pie, Donut, Line, Area, Matrix, Radar), dimensions, and metrics anytime
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddWidgetOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Chart</span>
            </button>
          </div>

          {widgets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
              <p className="text-sm text-slate-500">No chart widgets pinned to the dashboard.</p>
              <button
                type="button"
                onClick={() => setWidgets(DEFAULT_WIDGETS)}
                className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
              >
                Restore Default Charts
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {widgets.map(widget => (
                <CustomChartCard
                  key={widget.id}
                  widget={widget}
                  records={filteredRecords}
                  onUpdateWidget={handleUpdateWidget}
                  onRemoveWidget={handleRemoveWidget}
                  datasetInfo={datasetInfo}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 5: Transaction Ledger Data Table */}
        <section id="table">
          <DataTable
            records={filteredRecords}
            onDeleteRecord={handleDeleteRecord}
            datasetInfo={datasetInfo}
          />
        </section>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-xs font-medium text-slate-900 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <NewTransactionModal
        isOpen={isNewTxOpen}
        onClose={() => setIsNewTxOpen(false)}
        onAddRecord={handleAddNewRecord}
        nextOrderNumber={`TT-${orderSequence}`}
        datasetInfo={datasetInfo}
      />

      <AddWidgetModal
        isOpen={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
        onAddWidget={handleAddWidget}
        datasetInfo={datasetInfo}
      />

      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportDataset={handleImportDataset}
        currentDatasetName={datasetInfo.name}
      />
    </div>
  );
}
