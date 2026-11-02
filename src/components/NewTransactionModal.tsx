import React, { useState } from 'react';
import { GenericRecord, DatasetInfo } from '../types/sales';
import { PRODUCT_CATALOG, PAYMENT_METHODS } from '../data/initialData';
import { X, Plus, Trash2, Database } from 'lucide-react';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: Omit<GenericRecord, 'id'>) => void;
  nextOrderNumber: string;
  datasetInfo: DatasetInfo;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddRecord,
  nextOrderNumber,
  datasetInfo,
}) => {
  // Initialize form state dynamically from dataset columns
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    datasetInfo.columns.forEach(col => {
      if (col.key === 'orderNumber') initial[col.key] = nextOrderNumber;
      else if (col.key === 'product') initial[col.key] = PRODUCT_CATALOG[0].name;
      else if (col.key === 'price') initial[col.key] = PRODUCT_CATALOG[0].standardPrice;
      else if (col.type === 'date') initial[col.key] = new Date().toISOString().split('T')[0];
      else if (col.key === 'paymentMethod') initial[col.key] = 'Credit Card';
      else if (col.type === 'number') initial[col.key] = 100;
      else initial[col.key] = '';
    });
    return initial;
  });

  // Custom key-value pairs that user can arbitrarily attach to ANY record
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);

  if (!isOpen) return null;

  const handleChangeField = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleProductQuickSelect = (name: string) => {
    const catalogItem = PRODUCT_CATALOG.find(p => p.name === name);
    setFormData(prev => ({
      ...prev,
      product: name,
      ...(catalogItem && prev.price !== undefined ? { price: catalogItem.standardPrice } : {}),
    }));
  };

  const handleAddCustomField = () => {
    setCustomFields(prev => [...prev, { key: `field_${prev.length + 1}`, value: '' }]);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleCustomFieldChange = (index: number, keyOrVal: 'key' | 'value', text: string) => {
    setCustomFields(prev => {
      const copy = [...prev];
      copy[index][keyOrVal] = text;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recordToSave: Record<string, any> = { ...formData };

    // Format numbers
    datasetInfo.columns.forEach(col => {
      if (col.type === 'number') {
        recordToSave[col.key] = parseFloat(recordToSave[col.key]) || 0;
      }
    });

    // Attach any extra user-defined custom fields
    customFields.forEach(f => {
      if (f.key.trim()) {
        const num = parseFloat(f.value);
        recordToSave[f.key.trim()] = !isNaN(num) && String(num) === f.value.trim() ? num : f.value.trim();
      }
    });

    onAddRecord({
      ...recordToSave,
      isRealtimeAddition: true,
      createdAt: Date.now(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Add Record to {datasetInfo.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter any values or define custom fields for this record
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 overflow-y-auto flex-1 space-y-4 text-xs pr-1">
          {/* Dynamic Inputs for Dataset Columns */}
          {datasetInfo.columns.map(col => {
            const isProduct = col.key === 'product';
            const isPayment = col.key === 'paymentMethod';

            return (
              <div key={col.key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    {col.label}
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {col.type}
                  </span>
                </div>

                {isProduct ? (
                  <div className="space-y-1.5">
                    {/* Freeform text input with datalist auto-complete so ANY product can be entered */}
                    <input
                      type="text"
                      list="product-suggestions"
                      required
                      value={formData[col.key] || ''}
                      onChange={e => handleChangeField(col.key, e.target.value)}
                      placeholder="Type any product, service, or item name..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <datalist id="product-suggestions">
                      {PRODUCT_CATALOG.map(p => (
                        <option key={p.name} value={p.name} />
                      ))}
                    </datalist>

                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      <span className="text-slate-400 text-[10px] self-center">Quick Pick:</span>
                      {PRODUCT_CATALOG.slice(0, 4).map(p => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => handleProductQuickSelect(p.name)}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                        >
                          {p.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : isPayment ? (
                  <div>
                    {/* Freeform text with datalist for payment method / channel */}
                    <input
                      type="text"
                      list="payment-suggestions"
                      required
                      value={formData[col.key] || ''}
                      onChange={e => handleChangeField(col.key, e.target.value)}
                      placeholder="Credit Card, Wire Transfer, Crypto, Cash..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <datalist id="payment-suggestions">
                      {PAYMENT_METHODS.map(pm => (
                        <option key={pm} value={pm} />
                      ))}
                      <option value="Wire Transfer" />
                      <option value="Cryptocurrency" />
                      <option value="Direct Debit" />
                    </datalist>
                  </div>
                ) : col.type === 'number' ? (
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData[col.key] !== undefined ? formData[col.key] : ''}
                    onChange={e => handleChangeField(col.key, e.target.value)}
                    placeholder="Enter numerical value..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                ) : col.type === 'date' ? (
                  <input
                    type="date"
                    required
                    value={formData[col.key] || ''}
                    onChange={e => handleChangeField(col.key, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                ) : (
                  <input
                    type="text"
                    required
                    value={formData[col.key] || ''}
                    onChange={e => handleChangeField(col.key, e.target.value)}
                    placeholder={`Enter ${col.label}...`}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                )}
              </div>
            );
          })}

          {/* User-defined Custom Key-Value Fields */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-indigo-500" />
                Additional Custom Fields
              </span>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-medium cursor-pointer"
              >
                + Add Custom Field
              </button>
            </div>

            {customFields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Field Name (e.g., Region)"
                  value={field.key}
                  onChange={e => handleCustomFieldChange(idx, 'key', e.target.value)}
                  className="w-1/2 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={field.value}
                  onChange={e => handleCustomFieldChange(idx, 'value', e.target.value)}
                  className="w-1/2 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(idx)}
                  className="rounded p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 shrink-0">
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
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
