import React from 'react';
import { Star, CheckCircle2, Info, Flame, HelpCircle, Home } from 'lucide-react';
import type { Prediction } from '../types';
import { INSTITUTE_STATE_MAP } from '../data/instituteStateMap';

interface PredictionCardProps {
  pred: Prediction;
  wishlist: string[];
  toggleWishlist: (key: string) => void;
  predictionMode: '3-years' | 'latest-only' | '';
  latestYear: number;
  activeTooltipKey: string | null;
  setActiveTooltipKey: (key: string | null) => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  pred,
  wishlist,
  toggleWishlist,
  predictionMode,
  latestYear,
  activeTooltipKey,
  setActiveTooltipKey
}) => {
  const isStarred = wishlist.includes(pred.uniqueKey);
  const instState = INSTITUTE_STATE_MAP[pred.institute_id]?.state || 'Unknown';

  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/85 hover:shadow-md transition duration-200 relative flex flex-col justify-between space-y-4"
    >
      {/* Top Row: Probability & Wishlist Star */}
      <div className="flex justify-between items-start gap-2">
        {/* Probability Indicator Badge */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {pred.status === 'High' && (
            <span className="inline-flex items-center text-[10px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg">
              <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
              High Probability ({pred.probValue}%)
            </span>
          )}
          {pred.status === 'Medium' && (
            <span className="inline-flex items-center text-[10px] sm:text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg">
              <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
              Medium Probability ({pred.probValue}%)
            </span>
          )}
          {pred.status === 'Low' && (
            <span className="inline-flex items-center text-[10px] sm:text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg">
              <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
              Low Probability ({pred.probValue}%)
            </span>
          )}
          <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md">
            WCR: {pred.weightedClosingRank}
          </span>
          <div className="relative group inline-flex items-center">
            <span className="inline-flex items-center text-[10px] sm:text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
              {pred.institute_type === 'IIT' || pred.institute_type === 'IISc' ? 'IIT Desirability' : 'Mains Desirability'}: {pred.sdi.toFixed(1)}/100
              <HelpCircle
                className="h-3 w-3 ml-1.5 text-indigo-500 group-hover:text-indigo-600 dark:text-indigo-400 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTooltipKey(activeTooltipKey === pred.uniqueKey ? null : pred.uniqueKey);
                }}
              />
            </span>
            
            {/* Hover/Click Tooltip Box */}
            <div className={`fixed bottom-4 left-4 right-4 max-w-sm mx-auto mb-0 w-auto translate-x-0 sm:max-w-none sm:absolute sm:bottom-full sm:left-1/2 sm:-translate-x-1/2 sm:mb-2 sm:w-64 p-3 bg-slate-950 dark:bg-slate-900 text-white text-[10px] rounded-xl z-50 shadow-xl border border-slate-805 border-slate-800 transition-all duration-200 ${
              activeTooltipKey === pred.uniqueKey
                ? 'opacity-100 visible pointer-events-auto'
                : 'opacity-0 invisible sm:group-hover:opacity-100 sm:group-hover:visible pointer-events-none'
            }`}>
              <div className="font-bold border-b border-slate-800 pb-1 mb-1.5 text-[11px] text-indigo-400">
                Desirability Score
              </div>
              <div className="space-y-1.5 leading-relaxed text-slate-300 font-medium">
                <div>An objective desirability rating (out of 100) calculated from the latest year's JoSAA OPEN category CRL cutoff for the branch:</div>
                <div className="font-mono bg-slate-900 dark:bg-slate-950 p-1.5 rounded text-center text-indigo-300 text-[10px] font-semibold border border-slate-800">
                  Score = (1 - sqrt(OPEN_CRL / Max_OPEN_CRL)) * 100
                </div>
                <div>
                  • <strong className="text-slate-200">Exam Decoupled</strong>: Calculated separately for IITs (Advanced) and NITs/IIITs/GFTIs (Mains) using their respective maximum ranks.
                </div>
                <div>
                  • <strong className="text-slate-200">Quota Neutral</strong>: Uses the best cutoff across Home State & Other State quotas so regional benefits don't skew the rating.
                </div>
                <div>
                  • <strong className="text-slate-200">Category Agnostic</strong>: Uses the OPEN category cutoff so all category seats of a branch inherit the same rating, keeping branch rankings consistent.
                </div>
              </div>
              <div className="hidden sm:block w-2.5 h-2.5 bg-slate-950 dark:bg-slate-900 border-r border-b border-slate-800 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1.5 rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Wishlist Star */}
        <button
          onClick={() => toggleWishlist(pred.uniqueKey)}
          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition cursor-pointer"
          aria-label="Star Choice"
        >
          <Star className={`h-4.5 w-4.5 ${isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Middle Row: Institute & Branch */}
      <div>
        <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white leading-snug">
          {pred.institute_name}
        </h4>
        <p className="text-[11px] sm:text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">
          {pred.program_name}
        </p>
      </div>

      {/* Pills List */}
      <div className="flex flex-wrap gap-1.5">
        {/* Board */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
          pred.counselling_board === 'JoSAA' 
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40' 
            : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/40'
        }`}>
          {pred.counselling_board}
        </span>

        {/* Institute Type */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
          pred.institute_type === 'IIT' 
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40' 
            : 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40'
        }`}>
          {pred.institute_type}
        </span>

        {/* Quota */}
        {pred.quota === 'HS' || pred.quota === 'Home State' || pred.quota === 'Home State for Goa' ? (
          <span className="inline-flex items-center text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded">
            <Home className="h-3 w-3 mr-1" />
            Home State Quota ({instState})
          </span>
        ) : (
          <span className="text-[10px] font-bold bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-900/40 px-2 py-0.5 rounded">
            {pred.quota} Quota ({instState})
          </span>
        )}

        {/* Category */}
        <span className="text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-200 dark:border-violet-900/40 px-2 py-0.5 rounded">
          {pred.category} ({pred.rank_type === 'CRL' ? 'CRL Rank' : 'Category Rank'})
        </span>

        {/* Gender */}
        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 px-2 py-0.5 rounded">
          {pred.gender === 'Gender-Neutral' ? 'Neutral' : 'Female'}
        </span>
      </div>

      {/* Bottom Row: Cutoff info */}
      {predictionMode === 'latest-only' ? (
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl text-center">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{latestYear} Cutoff</div>
          <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
            {pred.closing_latest ? `${pred.closing_latest}` : 'N/A'}
          </div>
          {pred.last_round_latest && (
            <div className="text-[8px] text-slate-400">Round {pred.last_round_latest}</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl text-center">
          <div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{latestYear} Cutoff</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
              {pred.closing_latest ? `${pred.closing_latest}` : 'N/A'}
            </div>
            {pred.last_round_latest && (
              <div className="text-[8px] text-slate-400">Round {pred.last_round_latest}</div>
            )}
          </div>
          <div className="border-l border-r border-slate-200 dark:border-slate-800">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{latestYear - 1} Cutoff</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
              {pred.closing_prev ? `${pred.closing_prev}` : 'N/A'}
            </div>
            {pred.last_round_prev && (
              <div className="text-[8px] text-slate-400">Round {pred.last_round_prev}</div>
            )}
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{latestYear - 2} Cutoff</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
              {pred.closing_before ? `${pred.closing_before}` : 'N/A'}
            </div>
            {pred.last_round_before && (
              <div className="text-[8px] text-slate-400">Round {pred.last_round_before}</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
