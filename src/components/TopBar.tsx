import React from 'react';
import { Plus, Sun, Moon, Upload } from 'lucide-react';

interface TopBarProps {
  onOpenNewTransaction: () => void;
  onOpenImportData: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenNewTransaction,
  onOpenImportData,
  isDarkMode,
  onToggleDarkMode,
  activeSection,
  onSelectSection,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 border-b border-slate-200 bg-white/90 px-6 py-3.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a 
          href="#overview" 
          onClick={(e) => { e.preventDefault(); onSelectSection('overview'); }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 dark:text-slate-100 flex items-center gap-2"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono text-sm font-bold shadow-xs">
            Ω
          </div>
          <span>OmniMetrics</span>
        </a>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          type="button"
          onClick={() => onSelectSection('overview')}
          className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'overview' ? 'text-indigo-600 font-semibold dark:text-indigo-400' : ''
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('charts')}
          className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'charts' ? 'text-indigo-600 font-semibold dark:text-indigo-400' : ''
          }`}
        >
          Visualizations
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('stream')}
          className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'stream' ? 'text-indigo-600 font-semibold dark:text-indigo-400' : ''
          }`}
        >
          Live Stream
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('table')}
          className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'table' ? 'text-indigo-600 font-semibold dark:text-indigo-400' : ''
          }`}
        >
          Transactions
        </button>
      </nav>

      {/* Zone 3: Actions + Theme toggle */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={onOpenImportData}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5 text-indigo-500" />
          <span>Import Data</span>
        </button>

        <button
          type="button"
          onClick={onOpenNewTransaction}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Record</span>
        </button>
      </div>
    </header>
  );
};
