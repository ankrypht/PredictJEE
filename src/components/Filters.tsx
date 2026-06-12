import React from 'react';
import {
  Star,
  Search,
  MapPin,
  ChevronDown,
  GraduationCap,
  Building2,
  CheckCircle2,
  Info,
  Flame
} from 'lucide-react';
import { STATES_LIST } from '../data/constants';

interface FiltersProps {
  hasPredicted: boolean;
  allPredictionsCount: number;
  wishlistCount: number;
  activeTab: 'predictions' | 'wishlist';
  setActiveTab: (val: 'predictions' | 'wishlist') => void;
  queryTimeMs: number;
  advCrl: string;
  activeExamTab: 'advanced' | 'mains';
  setActiveExamTab: (val: 'advanced' | 'mains') => void;
  searchBranch: string;
  setSearchBranch: (val: string) => void;
  selectedStates: string[];
  setSelectedStates: (states: string[] | ((prev: string[]) => string[])) => void;
  showStatesDropdown: boolean;
  setShowStatesDropdown: (val: boolean) => void;
  selectedInstType: string;
  setSelectedInstType: (val: string) => void;
  selectedProbs: ('High' | 'Medium' | 'Low')[];
  toggleProbabilityFilter: (prob: 'High' | 'Medium' | 'Low') => void;
  advancedPredictionsCount: number;
  mainsPredictionsCount: number;
}

export const Filters: React.FC<FiltersProps> = ({
  hasPredicted,
  allPredictionsCount,
  wishlistCount,
  activeTab,
  setActiveTab,
  queryTimeMs,
  advCrl,
  activeExamTab,
  setActiveExamTab,
  searchBranch,
  setSearchBranch,
  selectedStates,
  setSelectedStates,
  showStatesDropdown,
  setShowStatesDropdown,
  selectedInstType,
  setSelectedInstType,
  selectedProbs,
  toggleProbabilityFilter,
  advancedPredictionsCount,
  mainsPredictionsCount
}) => {
  if (!hasPredicted) return null;

  const handleStateSelect = (state: string) => {
    setSelectedStates((prev: string[]) =>
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-4">
      {/* Results Count & Query Time metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-105 border-slate-100 dark:border-slate-800/60 pb-3">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Tabs to toggle All Predicted vs Wishlist */}
          <button
            onClick={() => setActiveTab('predictions')}
            className={`text-xs sm:text-sm font-bold pb-1 transition relative cursor-pointer ${
              activeTab === 'predictions' 
                ? 'text-brand-500 border-b-2 border-brand-500' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            All Predictions ({allPredictionsCount})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`text-xs sm:text-sm font-bold pb-1 transition flex items-center cursor-pointer ${
              activeTab === 'wishlist' 
                ? 'text-brand-500 border-b-2 border-brand-500' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Star className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 ${activeTab === 'wishlist' ? 'fill-brand-500 text-brand-500' : ''}`} />
            Wishlist ({wishlistCount})
          </button>
        </div>
        <span className="text-[11px] text-slate-400 font-semibold">
          Analyzed all rounds in {queryTimeMs}ms
        </span>
      </div>

      {/* Exam Switcher Tab Slider */}
      {advCrl && (
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 animate-fadeIn">
          <button
            type="button"
            onClick={() => {
              setActiveExamTab('advanced');
              setSelectedInstType('ALL');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeExamTab === 'advanced'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>JEE Advanced (IITs) ({advancedPredictionsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveExamTab('mains');
              setSelectedInstType('ALL');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeExamTab === 'mains'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>JEE Main (NITs/IIITs/GFTIs) ({mainsPredictionsCount})</span>
          </button>
        </div>
      )}

      {/* Filter controls */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Field */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search branch or college..."
            value={searchBranch}
            onChange={(e) => setSearchBranch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-1.5 sm:pl-10 sm:pr-4 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-800 dark:text-slate-100 font-medium"
          />
        </div>

        {/* State Location Multi-select dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatesDropdown(!showStatesDropdown)}
            className="w-full md:w-56 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
          >
            <span className="truncate flex items-center">
              <MapPin className="h-4 w-4 sm:h-4.5 sm:w-4.5 mr-1.5 text-slate-400" />
              {selectedStates.length === 0 
                ? "All Locations" 
                : `States (${selectedStates.length})`}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {showStatesDropdown && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowStatesDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-full sm:w-64 max-h-80 overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-40 p-2 space-y-1">
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-850 text-xs font-bold text-slate-400">
                  <span>Select Locations</span>
                  {selectedStates.length > 0 && (
                    <button 
                      onClick={() => setSelectedStates([])}
                      className="text-brand-500 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {STATES_LIST.map(state => {
                  const isChecked = selectedStates.includes(state);
                  return (
                    <button
                      key={state}
                      onClick={() => handleStateSelect(state)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                        isChecked 
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{state}</span>
                      {isChecked && <span className="text-[10px] bg-brand-500 text-white rounded-full px-1.5">✓</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Institute Type Pill Tabs */}
      {(!advCrl || activeExamTab === 'mains') && (
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'NIT', 'IIIT', 'GFTI'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedInstType(type)}
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border transition cursor-pointer ${
                selectedInstType === type 
                  ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/15' 
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              {type === 'ALL' ? 'All Institutes' : `${type}s`}
            </button>
          ))}
        </div>
      )}

      {/* Probability Filter Pill Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 sm:mr-1.5 select-none">
          Probability:
        </span>
        <button
          type="button"
          onClick={() => toggleProbabilityFilter('High')}
          className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border flex items-center space-x-1.5 transition duration-150 cursor-pointer ${
            selectedProbs.includes('High')
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm font-extrabold'
              : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-transparent hover:text-slate-500 dark:hover:text-slate-400'
          }`}
        >
          <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span>High</span>
        </button>
        <button
          type="button"
          onClick={() => toggleProbabilityFilter('Medium')}
          className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border flex items-center space-x-1.5 transition duration-150 cursor-pointer ${
            selectedProbs.includes('Medium')
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm font-extrabold'
              : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-transparent hover:text-slate-500 dark:hover:text-slate-400'
          }`}
        >
          <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span>Medium</span>
        </button>
        <button
          type="button"
          onClick={() => toggleProbabilityFilter('Low')}
          className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border flex items-center space-x-1.5 transition duration-150 cursor-pointer ${
            selectedProbs.includes('Low')
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 shadow-sm font-extrabold'
              : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-transparent hover:text-slate-500 dark:hover:text-slate-400'
          }`}
        >
          <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span>Low</span>
        </button>
      </div>

    </div>
  );
};
