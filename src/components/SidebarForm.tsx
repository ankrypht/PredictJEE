import React from 'react';
import { SlidersHorizontal, ChevronDown, Award } from 'lucide-react';
import { STATES_LIST, CATEGORIES_LIST } from '../data/constants';

interface SidebarFormProps {
  homeState: string;
  setHomeState: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  predictionMode: '3-years' | 'latest-only' | '';
  setPredictionMode: (val: '3-years' | 'latest-only' | '') => void;
  mainCrl: string;
  setMainCrl: (val: string) => void;
  mainCategoryRank: string;
  setMainCategoryRank: (val: string) => void;
  advCrl: string;
  setAdvCrl: (val: string) => void;
  advCategoryRank: string;
  setAdvCategoryRank: (val: string) => void;
  agreeTerms: boolean;
  setAgreeTerms: (val: boolean) => void;
  handlePredict: (e?: React.FormEvent) => void;
  dbLoaded: boolean;
  latestYear: number;
}

export const SidebarForm: React.FC<SidebarFormProps> = ({
  homeState,
  setHomeState,
  category,
  setCategory,
  gender,
  setGender,
  predictionMode,
  setPredictionMode,
  mainCrl,
  setMainCrl,
  mainCategoryRank,
  setMainCategoryRank,
  advCrl,
  setAdvCrl,
  advCategoryRank,
  setAdvCategoryRank,
  agreeTerms,
  setAgreeTerms,
  handlePredict,
  dbLoaded,
  latestYear
}) => {
  const isReservedCategory = category !== '' && category !== 'OPEN';

  return (
    <section className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-md shadow-slate-100 dark:shadow-none space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
          <SlidersHorizontal className="h-4.5 w-4.5 sm:h-5 sm:w-5 mr-2 text-brand-500" />
          Candidate Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Fill in your state, category, and JEE ranks.</p>
      </div>

      <form onSubmit={handlePredict} className="space-y-4">
        {/* Home State */}
        <div>
          <label htmlFor="homeState" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Home State / UT <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              id="homeState"
              value={homeState}
              onChange={(e) => setHomeState(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 appearance-none text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="">-- Select Home State / UT --</option>
              {STATES_LIST.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Category & Gender (Side-by-side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="category" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Seat Category
            </label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 appearance-none text-slate-800 dark:text-slate-100 font-medium"
              >
                <option value="">-- Select Category --</option>
                {CATEGORIES_LIST.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="gender" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Gender Pool
            </label>
            <div className="relative">
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 appearance-none text-slate-800 dark:text-slate-100 font-medium"
              >
                <option value="">-- Select Gender Pool --</option>
                <option value="Gender-Neutral">Gender-Neutral</option>
                <option value="Female-only (including Supernumerary)">Female-only</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Prediction Basis */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Prediction Basis
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPredictionMode('3-years')}
              className={`py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer ${predictionMode === '3-years'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              3-Year Weighted
            </button>
            <button
              type="button"
              onClick={() => setPredictionMode('latest-only')}
              className={`py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer ${predictionMode === 'latest-only'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              Latest Year Only
            </button>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {predictionMode === '3-years' ? (
              <span>
                <strong>Recommended.</strong> Weighted: 70% Latest year ({latestYear}), 20% Previous ({latestYear - 1}), 10% Before ({latestYear - 2}).
              </span>
            ) : (
              <span>
                Strict: Evaluates cutoffs using only the latest academic year ({latestYear}) data.
              </span>
            )}
          </p>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* JEE Main Ranks */}
        <div className="space-y-3">
          <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <Award className="h-4 w-4 mr-1.5 text-brand-400" />
            JEE Main Ranks (NIT/IIIT/GFTI)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="mainCrl" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                CRL Rank <span className="text-rose-500">*</span>
              </label>
              <input
                id="mainCrl"
                type="number"
                placeholder="e.g. 15000"
                value={mainCrl}
                onChange={(e) => setMainCrl(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label htmlFor="mainCategoryRank" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Category Rank {isReservedCategory && <span className="text-rose-500">*</span>}
              </label>
              <input
                id="mainCategoryRank"
                type="number"
                placeholder={isReservedCategory ? "e.g. 2400" : "Disabled (OPEN)"}
                value={mainCategoryRank}
                onChange={(e) => setMainCategoryRank(e.target.value)}
                disabled={!isReservedCategory}
                required={isReservedCategory}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* JEE Advanced Ranks */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Award className="h-4 w-4 mr-1.5 text-amber-400" />
              JEE Advanced Ranks (IITs)
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold italic text-slate-400">Optional</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="advCrl" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                CRL Rank
              </label>
              <input
                id="advCrl"
                type="number"
                placeholder="e.g. 4500"
                value={advCrl}
                onChange={(e) => setAdvCrl(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label htmlFor="advCategoryRank" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Category Rank
              </label>
              <input
                id="advCategoryRank"
                type="number"
                placeholder={isReservedCategory ? "e.g. 850" : "Disabled (OPEN)"}
                value={advCategoryRank}
                onChange={(e) => setAdvCategoryRank(e.target.value)}
                disabled={!isReservedCategory}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-start space-x-3 pt-2">
          <input
            id="agreeTerms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950 accent-brand-500 cursor-pointer"
          />
          <label htmlFor="agreeTerms" className="text-[10px] sm:text-[11px] leading-snug text-slate-500 dark:text-slate-400 select-none cursor-pointer">
            I understand this is an indicative predictor based on past counselling cutoffs, and actual {latestYear + 1} cutoffs may differ. I agree to the <a href="./terms.html" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Terms &amp; Conditions</a>.
          </label>
        </div>

        {/* Predict Button */}
        <button
          type="submit"
          disabled={!agreeTerms || !dbLoaded}
          className="w-full py-2.5 sm:py-3 px-4 mt-4 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 text-xs sm:text-sm tracking-wide cursor-pointer"
        >
          Predict Choices
        </button>
      </form>
    </section>
  );
};
