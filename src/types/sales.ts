export type PaymentMethod = string;

export interface DataColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date';
}

export interface GenericRecord {
  id: string;
  [key: string]: any;
  isRealtimeAddition?: boolean;
  createdAt?: number;
}

export type SaleRecord = GenericRecord;

export type ChartType = 
  | 'bar' 
  | 'horizontal-bar' 
  | 'pie' 
  | 'donut' 
  | 'line' 
  | 'area' 
  | 'matrix' 
  | 'radar';

export type DimensionType = string;
export type MetricType = string;
export type MetricAgg = 'sum' | 'avg' | 'count';

export type ColorTheme = 
  | 'indigo' 
  | 'emerald' 
  | 'amber' 
  | 'rose' 
  | 'ocean' 
  | 'monochrome';

export type SortOption = 'desc' | 'asc' | 'alpha' | 'chrono';

export interface WidgetConfig {
  id: string;
  title: string;
  type: ChartType;
  dimension: DimensionType;
  metric: MetricType;
  metricAgg?: MetricAgg;
  colorTheme: ColorTheme;
  sortBy: SortOption;
  topN: number; // 0 for all, or 5, 8, 10
  span: 'half' | 'full';
  description?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedCategories: Record<string, string[]>;
  startDate: string;
  endDate: string;
  minMetric: number;
  maxMetric: number;
  // For backwards compatibility
  selectedProducts: string[];
  selectedPaymentMethods: string[];
  minPrice: number;
  maxPrice: number;
}

export interface AggregatedDataPoint {
  label: string;
  subLabel?: string;
  value: number;
  formattedValue: string;
  count: number;
  percentage: number;
  color?: string;
  raw?: unknown;
}

export interface SummaryKPIs {
  totalRevenue: number;
  totalUnits: number;
  uniqueOrders: number;
  averageOrderValue: number;
  primaryMetricLabel?: string;
  topProduct: {
    name: string;
    revenue: number;
    units: number;
  };
  dominantPaymentMethod: {
    name: string;
    sharePercent: number;
    count: number;
  };
}

export interface DatasetInfo {
  id: string;
  name: string;
  description: string;
  columns: DataColumn[];
  primaryDimension: string;
  primaryMetric: string;
  primaryDateColumn?: string;
  isCustom?: boolean;
}
