import React, { useState } from 'react';
import { DatasetInfo, GenericRecord, DataColumn } from '../types/sales';
import { parseDelimitedData, PRESET_DATASETS } from '../utils/dataParser';
import { RAW_SALES_CSV, parseSalesCSV } from '../data/initialData';
import { X, Upload, FileText, Sparkles, Check, AlertCircle } from 'lucide-react';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDataset: (info: DatasetInfo, records: GenericRecord[]) => void;
  currentDatasetName: string;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  onImportDataset,
  currentDatasetName,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'presets'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [datasetTitle, setDatasetTitle] = useState('Custom Dataset');
  const [previewData, setPreviewData] = useState<{
    columns: DataColumn[];
    records: GenericRecord[];
    info: DatasetInfo;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const name = file.name.replace(/\.[^/.]+$/, '');
        const parsed = parseDelimitedData(text, name);
        setDatasetTitle(name);
        setPreviewData(parsed);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to parse file. Please verify CSV formatting.');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  const handleParsePasted = () => {
    setErrorMsg(null);
    if (!pastedText.trim()) {
      setErrorMsg('Please paste some CSV or tab-delimited data first.');
      return;
    }
    try {
      const parsed = parseDelimitedData(pastedText, datasetTitle.trim() || 'Custom Pasted Data');
      setPreviewData(parsed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse pasted data.');
    }
  };

  const handleSelectPreset = (presetName: string) => {
    setErrorMsg(null);
    if (presetName === 'Original Apparel Sales') {
      const records = parseSalesCSV(RAW_SALES_CSV);
      const info: DatasetInfo = {
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
      setPreviewData({ columns: info.columns, records, info });
      setDatasetTitle(info.name);
      return;
    }

    const preset = PRESET_DATASETS.find(p => p.name === presetName);
    if (preset) {
      try {
        const parsed = parseDelimitedData(preset.csv, preset.name);
        setDatasetTitle(preset.name);
        setPreviewData(parsed);
      } catch (err: any) {
        setErrorMsg(err.message);
      }
    }
  };

  const handleConfirmImport = () => {
    if (!previewData) return;
    onImportDataset(
      { ...previewData.info, name: datasetTitle || previewData.info.name },
      previewData.records
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Import Any Dataset
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Load custom CSVs, spreadsheet data, or demo datasets with auto-detected dimensions and metrics
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

        {/* Navigation Tabs */}
        <div className="mt-4 flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('upload'); setPreviewData(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('paste'); setPreviewData(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Paste CSV / Table</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('presets'); setPreviewData(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Presets & Templates</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 overflow-y-auto flex-1 space-y-4 text-xs pr-1">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:bg-slate-100/50 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                <Upload className="h-8 w-8 text-indigo-500 mb-2" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Select or drop any CSV, TSV, or TXT file
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Supports comma, tab, or semicolon separated data
                </span>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Dataset Name
                </label>
                <input
                  type="text"
                  value={datasetTitle}
                  onChange={e => setDatasetTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Paste Raw Data (CSV or Copied from Excel / Sheets)
                </label>
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  placeholder={`Product,Units,Revenue,Region,Date\nWidget Alpha,50,$2500,North,2025-08-01\nWidget Beta,80,$3200,South,2025-08-02`}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 font-mono text-[11px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <button
                type="button"
                onClick={handleParsePasted}
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
              >
                Inspect & Preview Data
              </button>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              <div
                onClick={() => handleSelectPreset('Original Apparel Sales')}
                className="rounded-lg border border-slate-200 bg-white p-3 hover:border-indigo-400 hover:bg-indigo-50/20 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-500 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Retail Apparel Sales (Active Original)
                  </div>
                  {currentDatasetName === 'Retail Apparel Sales' && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                      <Check className="h-3.5 w-3.5" /> Current
                    </span>
                  )}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  116 orders of tailored denim, joggers, chinos, and payment channels
                </div>
              </div>

              {PRESET_DATASETS.map(p => (
                <div
                  key={p.name}
                  onClick={() => handleSelectPreset(p.name)}
                  className="rounded-lg border border-slate-200 bg-white p-3 hover:border-indigo-400 hover:bg-indigo-50/20 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {p.name}
                    </div>
                    {currentDatasetName === p.name && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <Check className="h-3.5 w-3.5" /> Current
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {p.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Preview Section */}
          {previewData && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    Preview: {datasetTitle || previewData.info.name}
                  </h4>
                  <div className="text-[11px] text-slate-500">
                    Detected {previewData.records.length} records · {previewData.columns.length} columns
                  </div>
                </div>
                <span className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  Ready to Load
                </span>
              </div>

              {/* Detected Column chips */}
              <div>
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Detected Schema & Types:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {previewData.columns.map(col => (
                    <span
                      key={col.key}
                      className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    >
                      {col.label} <span className="text-indigo-500 font-semibold">({col.type})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Rows table */}
              <div className="overflow-x-auto max-h-36 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                      {previewData.columns.map(c => (
                        <th key={c.key} className="py-1 px-2 font-semibold">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previewData.records.slice(0, 4).map((row, i) => (
                      <tr key={i}>
                        {previewData.columns.map(c => (
                          <td key={c.key} className="py-1 px-2 text-slate-700 dark:text-slate-300 font-mono">
                            {String(row[c.key] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!previewData}
            onClick={handleConfirmImport}
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            Load Dataset into Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
