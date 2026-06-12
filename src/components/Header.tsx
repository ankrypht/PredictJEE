import React from 'react';
import { LayoutDashboard, AlertCircle, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  dbLoaded: boolean;
  dbError: string | null;
  dbProgress: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  dbLoaded,
  dbError,
  dbProgress,
  darkMode,
  setDarkMode
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="p-2 bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/30 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-white flex items-center">
              JEE Predictor
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">100% Free &amp; Ad-free College Predictor</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {dbLoaded ? (
            <div className="hidden md:flex items-center space-x-2 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Database loaded (Instant queries)</span>
            </div>
          ) : dbError ? (
            <div className="hidden md:flex items-center space-x-2 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full font-medium">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500" />
              <span>Loading failed: {dbError}</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"></span>
              <span>Downloading SQLite Database: {dbProgress}%</span>
            </div>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
