import React from 'react';

interface FooterProps {
  latestYear: number;
}

export const Footer: React.FC<FooterProps> = ({ latestYear }) => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-6 text-left">
          <div className="max-w-md space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">What is WCR (Weighted Closing Rank)?</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              A normalized cutoff calculated from JoSAA/CSAB history. Under 3-Year Weighted basis, WCR weights the latest year at 70% ({latestYear}), previous at 20% ({latestYear - 1}), and prior at 10% ({latestYear - 2}). Under Latest Year Only basis, WCR reflects the exact latest year cutoff.
            </p>
          </div>
          <div className="max-w-md space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">What is the Desirability Score?</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              An objective rating (out of 100) calculated using the normalized base competitiveness of the JoSAA OPEN category CRL cutoff for the branch. All category seats of a branch inherit the same OPEN-based score, ensuring consistent sorting so the actual best seats rank at the top regardless of entry pathway. The scale is dynamically determined by OPEN CRL max ranks, objective-normalized, and decoupled between exam types.
            </p>
          </div>
        </div>
        <p className="font-medium text-slate-500 dark:text-slate-400 pt-2">
          Created by <span className="font-bold text-brand-600 dark:text-brand-400">Ankush</span> &bull; 100% Free &amp; Ad-free College Predictor
        </p>
      </div>
    </footer>
  );
};
