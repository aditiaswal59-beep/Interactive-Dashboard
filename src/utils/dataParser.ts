import { DataColumn, GenericRecord, DatasetInfo } from '../types/sales';

export function parseDelimitedData(rawText: string, datasetName = 'Custom Imported Dataset'): {
  columns: DataColumn[];
  records: GenericRecord[];
  info: DatasetInfo;
} {
  const cleanText = rawText.trim();
  if (!cleanText) {
    throw new Error('Data input is empty');
  }

  // Detect delimiter (tab or comma or semicolon)
  const firstLine = cleanText.split('\n')[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  // Parse lines with quotes support
  const rows: string[][] = [];
  const lines = cleanText.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;
    // Simple robust regex parser for quoted CSV
    const row: string[] = [];
    let insideQuote = false;
    let entry = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === delimiter && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    rows.push(row);
  }

  if (rows.length < 2) {
    throw new Error('Data requires at least a header row and 1 data row.');
  }

  const rawHeaders = rows[0];
  const dataRows = rows.slice(1);

  // Clean keys
  const columns: DataColumn[] = rawHeaders.map((header, idx) => {
    const cleanLabel = header.replace(/^["']|["']$/g, '').trim() || `Column_${idx + 1}`;
    // camelCase or sanitized key
    const key = cleanLabel
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '') || `col${idx}`;

    return {
      key,
      label: cleanLabel,
      type: 'string', // will detect below
    };
  });

  // Infer types by sampling data rows
  columns.forEach((col, cIdx) => {
    let numericCount = 0;
    let dateCount = 0;
    let validSampleCount = 0;

    dataRows.slice(0, 50).forEach(r => {
      const val = r[cIdx]?.replace(/[$€£,]/g, '').trim();
      if (val !== undefined && val !== '') {
        validSampleCount++;
        const num = parseFloat(val);
        if (!isNaN(num) && isFinite(Number(val))) {
          numericCount++;
        } else if (/^\d{4}-\d{2}-\d{2}/.test(val) || !isNaN(Date.parse(val))) {
          dateCount++;
        }
      }
    });

    if (validSampleCount > 0) {
      if (numericCount / validSampleCount > 0.7) {
        col.type = 'number';
      } else if (dateCount / validSampleCount > 0.7) {
        col.type = 'date';
      }
    }
  });

  // Parse records
  const records: GenericRecord[] = dataRows.map((r, rIdx) => {
    const item: GenericRecord = {
      id: `imported_${Date.now()}_${rIdx}`,
    };

    columns.forEach((col, cIdx) => {
      const rawVal = r[cIdx] !== undefined ? r[cIdx] : '';
      if (col.type === 'number') {
        const cleaned = rawVal.replace(/[$€£,]/g, '').trim();
        item[col.key] = parseFloat(cleaned) || 0;
      } else {
        item[col.key] = rawVal.replace(/^["']|["']$/g, '').trim();
      }
    });

    // Provide standard fallbacks for classic widgets
    if (!item.product && columns.find(c => c.type === 'string')) {
      const firstStrCol = columns.find(c => c.type === 'string')!;
      item.product = item[firstStrCol.key];
    }
    if (!item.price && columns.find(c => c.type === 'number')) {
      const firstNumCol = columns.find(c => c.type === 'number')!;
      item.price = item[firstNumCol.key];
    }
    if (!item.date && columns.find(c => c.type === 'date')) {
      const firstDateCol = columns.find(c => c.type === 'date')!;
      item.date = item[firstDateCol.key];
    }

    return item;
  });

  // Determine primary dimension, metric, and date
  const primaryMetricCol = columns.find(c => c.type === 'number') || columns[0];
  const primaryDimensionCol = columns.find(c => c.type === 'string' && c.key !== 'id') || columns[0];
  const primaryDateCol = columns.find(c => c.type === 'date');

  const info: DatasetInfo = {
    id: `dataset_${Date.now()}`,
    name: datasetName,
    description: `Contains ${records.length} records across ${columns.length} columns`,
    columns,
    primaryDimension: primaryDimensionCol.key,
    primaryMetric: primaryMetricCol.key,
    primaryDateColumn: primaryDateCol?.key,
    isCustom: true,
  };

  return { columns, records, info };
}

export const PRESET_DATASETS: { name: string; description: string; csv: string }[] = [
  {
    name: 'SaaS Subscriptions & MRR',
    description: 'Enterprise cloud accounts, license tiers, monthly recurring revenue, and regions',
    csv: `Account,Tier,Monthly MRR,Region,Renewal Date,Status
Acme Corp,Enterprise,$2450.00,North America,2025-09-15,Active
Global Logistics,Professional,$1200.00,Europe,2025-09-16,Active
Starlight Bio,Enterprise,$3100.00,North America,2025-09-17,Active
FinTech Dynamics,Starter,$450.00,Asia Pacific,2025-09-18,Pending
HyperScale Data,Enterprise,$4800.00,Europe,2025-09-19,Active
Zenith Healthcare,Professional,$1550.00,North America,2025-09-20,Active
AeroSpace Systems,Enterprise,$5200.00,North America,2025-09-21,Active
BlueWave Media,Starter,$390.00,Latin America,2025-09-22,Active
Nordic Retail,Professional,$1800.00,Europe,2025-09-23,Active
Quantum Labs,Enterprise,$3600.00,Asia Pacific,2025-09-24,Active
Vanguard Security,Professional,$1400.00,North America,2025-09-25,Active
Alpha Robotics,Enterprise,$4200.00,Europe,2025-09-26,Active`
  },
  {
    name: 'Hardware & Devices Inventory',
    description: 'Physical inventory units, wholesale unit cost, batch total value, and shipping warehouse',
    csv: `Device Model,Category,Units Stocked,Unit Cost,Warehouse,Arrival Date
Spectra X1 GPU,Graphics,140,$850.00,North Hub,2025-08-10
Quantum Core CPU,Processors,320,$320.00,West Depot,2025-08-12
Titan NVMe 4TB,Storage,550,$180.00,East Terminal,2025-08-14
Veloce DDR5 64GB,Memory,420,$145.00,North Hub,2025-08-15
Nexus Motherboard,Components,210,$260.00,Central Vault,2025-08-18
AeroFlow 850W PSU,Power,380,$110.00,West Depot,2025-08-20
Matrix Liquid Cooler,Thermal,290,$95.00,Central Vault,2025-08-22
Obsidian Tower Case,Chassis,180,$140.00,East Terminal,2025-08-25`
  }
];
