import { 
  GenericRecord, 
  DimensionType, 
  MetricType, 
  SortOption, 
  AggregatedDataPoint, 
  SummaryKPIs,
  ColorTheme,
  DatasetInfo
} from '../types/sales';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toFixed(0)}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(val: number): string {
  return `${val.toFixed(1)}%`;
}

export function getPriceTier(price: number): string {
  if (price < 75) return 'Economy (< $75)';
  if (price < 90) return 'Standard ($75 - $89)';
  if (price < 120) return 'Premium ($90 - $119)';
  return 'Luxury ($120+)';
}

export function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getUTCMonth()];
  const day = d.getUTCDate();
  const weekNum = Math.ceil(day / 7);
  return `${month} W${weekNum}`;
}

export const THEME_PALETTES: Record<ColorTheme, string[]> = {
  indigo: [
    '#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE',
    '#3730A3', '#312E81', '#1E1B4B', '#4338CA', '#8B5CF6'
  ],
  emerald: [
    '#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0',
    '#047857', '#065F46', '#064E3B', '#0D9488', '#14B8A6'
  ],
  amber: [
    '#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A',
    '#B45309', '#92400E', '#78350F', '#EA580C', '#FB923C'
  ],
  rose: [
    '#E11D48', '#F43F5E', '#FB7185', '#FDA4AF', '#FECDD3',
    '#BE123C', '#9F1239', '#881337', '#DB2777', '#F472B6'
  ],
  ocean: [
    '#0284C7', '#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD',
    '#0369A1', '#075985', '#0C4A6E', '#2563EB', '#60A5FA'
  ],
  monochrome: [
    '#18181B', '#27272A', '#3F3F46', '#52525B', '#71717A',
    '#A1A1AA', '#D4D4D8', '#E4E4E7', '#262626', '#404040'
  ]
};

export function calculateSummaryKPIs(records: GenericRecord[], datasetInfo?: DatasetInfo): SummaryKPIs {
  if (records.length === 0) {
    return {
      totalRevenue: 0,
      totalUnits: 0,
      uniqueOrders: 0,
      averageOrderValue: 0,
      primaryMetricLabel: 'Gross Sales',
      topProduct: { name: 'None', revenue: 0, units: 0 },
      dominantPaymentMethod: { name: 'None', sharePercent: 0, count: 0 },
    };
  }

  // Find primary numeric key (e.g. price, mrr, revenue, or first numeric)
  const metricKey = datasetInfo?.primaryMetric || (records[0]?.price !== undefined ? 'price' : Object.keys(records[0] || {}).find(k => typeof records[0][k] === 'number') || 'price');
  
  // Find primary dimension key (e.g. product, tier, account, category)
  const dimKey = datasetInfo?.primaryDimension || (records[0]?.product !== undefined ? 'product' : Object.keys(records[0] || {}).find(k => typeof records[0][k] === 'string' && k !== 'id') || 'product');

  // Find secondary dimension key (e.g. paymentMethod, region, warehouse)
  const secDimKey = records[0]?.paymentMethod !== undefined ? 'paymentMethod' : Object.keys(records[0] || {}).find(k => typeof records[0][k] === 'string' && k !== 'id' && k !== dimKey) || dimKey;

  const totalRevenue = records.reduce((sum, r) => sum + (Number(r[metricKey]) || 0), 0);
  const totalUnits = records.length;
  
  const orderSet = new Set<string>();
  records.forEach(r => {
    orderSet.add(r.orderNumber || r.id);
  });
  const uniqueOrders = orderSet.size;
  const averageOrderValue = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0;

  // Dimension breakdown map
  const dimMap: Record<string, { value: number; count: number }> = {};
  records.forEach(r => {
    const key = String(r[dimKey] || 'Other');
    if (!dimMap[key]) {
      dimMap[key] = { value: 0, count: 0 };
    }
    dimMap[key].value += Number(r[metricKey]) || 0;
    dimMap[key].count += 1;
  });

  let topItem = { name: 'None', value: 0, count: 0 };
  Object.entries(dimMap).forEach(([name, data]) => {
    if (data.value > topItem.value) {
      topItem = { name, value: data.value, count: data.count };
    }
  });

  // Secondary dimension breakdown map
  const secMap: Record<string, number> = {};
  records.forEach(r => {
    const key = String(r[secDimKey] || 'Other');
    secMap[key] = (secMap[key] || 0) + 1;
  });

  let dominantSec = { name: 'None', count: 0 };
  Object.entries(secMap).forEach(([name, count]) => {
    if (count > dominantSec.count) {
      dominantSec = { name, count };
    }
  });

  const dominantShare = totalUnits > 0 ? (dominantSec.count / totalUnits) * 100 : 0;

  return {
    totalRevenue,
    totalUnits,
    uniqueOrders,
    averageOrderValue,
    primaryMetricLabel: datasetInfo?.columns.find(c => c.key === metricKey)?.label || 'Gross Sales',
    topProduct: {
      name: topItem.name,
      revenue: topItem.value,
      units: topItem.count,
    },
    dominantPaymentMethod: {
      name: dominantSec.name,
      sharePercent: dominantShare,
      count: dominantSec.count,
    },
  };
}

export function aggregateSalesData(
  records: GenericRecord[],
  dimension: DimensionType,
  metric: MetricType,
  sortBy: SortOption,
  topN: number,
  theme: ColorTheme = 'indigo'
): AggregatedDataPoint[] {
  if (records.length === 0) return [];

  const groups: Record<string, { sum: number; count: number }> = {};

  records.forEach(r => {
    let key = '';
    if (dimension === 'product') {
      key = String(r.product || r[Object.keys(r).find(k => typeof r[k] === 'string' && k !== 'id') || ''] || 'Unknown');
    } else if (dimension === 'paymentMethod') {
      key = String(r.paymentMethod || 'Other');
    } else if (dimension === 'date') {
      key = String(r.date || 'Undated');
    } else if (dimension === 'week') {
      key = getWeekLabel(String(r.date || ''));
    } else if (dimension === 'priceTier') {
      key = getPriceTier(Number(r.price || r[metric] || 0));
    } else {
      key = String(r[dimension] !== undefined && r[dimension] !== null ? r[dimension] : 'Unknown');
    }

    if (!groups[key]) {
      groups[key] = { sum: 0, count: 0 };
    }

    let val = 0;
    if (metric === 'revenue' || metric === 'price') {
      val = Number(r.price ?? r.revenue ?? r[metric] ?? 0);
    } else if (metric === 'units') {
      val = 1;
    } else {
      val = Number(r[metric] ?? 0);
    }

    groups[key].sum += val;
    groups[key].count += 1;
  });

  const isUnitsOnly = metric === 'units';
  const totalMetricSum = Object.values(groups).reduce((acc, g) => acc + (isUnitsOnly ? g.count : g.sum), 0);

  let points: AggregatedDataPoint[] = Object.entries(groups).map(([label, data]) => {
    let value = 0;
    let formattedValue = '';

    if (isUnitsOnly) {
      value = data.count;
      formattedValue = `${formatNumber(value)} units`;
    } else if (metric === 'avgOrderValue') {
      value = data.count > 0 ? data.sum / data.count : 0;
      formattedValue = formatCurrency(value);
    } else {
      value = data.sum;
      // Auto-detect currency vs standard integer
      if (metric.toLowerCase().includes('price') || metric.toLowerCase().includes('revenue') || metric.toLowerCase().includes('mrr') || metric.toLowerCase().includes('cost')) {
        formattedValue = formatCurrency(value);
      } else {
        formattedValue = formatNumber(value);
      }
    }

    const percentage = totalMetricSum > 0 ? (value / totalMetricSum) * 100 : 0;

    return {
      label,
      value,
      formattedValue,
      count: data.count,
      percentage,
      raw: data,
    };
  });

  // Sorting
  points.sort((a, b) => {
    if (sortBy === 'desc') return b.value - a.value;
    if (sortBy === 'asc') return a.value - b.value;
    if (sortBy === 'alpha') return a.label.localeCompare(b.label);
    if (sortBy === 'chrono') return a.label.localeCompare(b.label);
    return 0;
  });

  // Top N filter
  if (topN > 0 && points.length > topN) {
    const topItems = points.slice(0, topN);
    const otherItems = points.slice(topN);
    const otherValue = otherItems.reduce((acc, p) => acc + p.value, 0);
    const otherCount = otherItems.reduce((acc, p) => acc + p.count, 0);
    const otherPercentage = totalMetricSum > 0 ? (otherValue / totalMetricSum) * 100 : 0;

    let otherFormatted = '';
    if (isUnitsOnly) otherFormatted = `${formatNumber(otherCount)} units`;
    else otherFormatted = formatCurrency(otherValue);

    points = [
      ...topItems,
      {
        label: 'Other Categories',
        value: otherValue,
        formattedValue: otherFormatted,
        count: otherCount,
        percentage: otherPercentage,
      },
    ];
  }

  // Assign color palette
  const colors = THEME_PALETTES[theme] || THEME_PALETTES.indigo;
  points = points.map((p, idx) => ({
    ...p,
    color: colors[idx % colors.length],
  }));

  return points;
}

export function generatePaymentMatrix(records: GenericRecord[], rowKey = 'product', colKey = 'paymentMethod'): {
  products: string[];
  paymentMethods: string[];
  matrix: Record<string, Record<string, { revenue: number; count: number }>>;
  maxRevenue: number;
  rowLabel: string;
  colLabel: string;
} {
  if (records.length === 0) {
    return { products: [], paymentMethods: [], matrix: {}, maxRevenue: 1, rowLabel: 'Item', colLabel: 'Channel' };
  }

  // Resolve keys if not found
  const first = records[0];
  const actualRowKey = first[rowKey] !== undefined ? rowKey : Object.keys(first).find(k => typeof first[k] === 'string' && k !== 'id') || 'product';
  const actualColKey = first[colKey] !== undefined ? colKey : Object.keys(first).find(k => typeof first[k] === 'string' && k !== 'id' && k !== actualRowKey) || actualRowKey;

  const products = Array.from(new Set(records.map(r => String(r[actualRowKey] || 'Other')))).slice(0, 15);
  const paymentMethods = Array.from(new Set(records.map(r => String(r[actualColKey] || 'Other')))).slice(0, 8);
  
  const matrix: Record<string, Record<string, { revenue: number; count: number }>> = {};
  let maxRevenue = 0;

  products.forEach(p => {
    matrix[p] = {};
    paymentMethods.forEach(pm => {
      matrix[p][pm] = { revenue: 0, count: 0 };
    });
  });

  const numKey = first.price !== undefined ? 'price' : Object.keys(first).find(k => typeof first[k] === 'number') || '';

  records.forEach(r => {
    const rowVal = String(r[actualRowKey] || 'Other');
    const colVal = String(r[actualColKey] || 'Other');
    if (matrix[rowVal] && matrix[rowVal][colVal]) {
      const val = numKey ? Number(r[numKey]) || 0 : 1;
      matrix[rowVal][colVal].revenue += val;
      matrix[rowVal][colVal].count += 1;
      if (matrix[rowVal][colVal].revenue > maxRevenue) {
        maxRevenue = matrix[rowVal][colVal].revenue;
      }
    }
  });

  return {
    products,
    paymentMethods,
    matrix,
    maxRevenue: maxRevenue || 1,
    rowLabel: actualRowKey,
    colLabel: actualColKey,
  };
}

export function exportToCSV(records: GenericRecord[], filename = 'Dataset_Export.csv'): void {
  if (records.length === 0) return;

  // Collect all keys
  const keys = Object.keys(records[0]).filter(k => k !== 'id' && k !== 'createdAt' && k !== 'isRealtimeAddition');
  const headers = keys.map(k => k.charAt(0).toUpperCase() + k.slice(1));
  const rows = records.map(r => keys.map(k => {
    const val = r[k];
    if (typeof val === 'number') return val;
    return `"${String(val || '').replace(/"/g, '""')}"`;
  }));

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
