import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BookOpen, Info } from 'lucide-react';

import type { CutoffRow, Prediction, QueryInputs, PredictionMode } from './types';
import { predictChoices } from './utils/prediction';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DbLoader } from './components/DbLoader';
import { DbError } from './components/DbError';
import { SidebarForm } from './components/SidebarForm';
import { Filters } from './components/Filters';
import { PredictionCard } from './components/PredictionCard';
import { INSTITUTE_STATE_MAP } from './data/instituteStateMap';

export default function App() {
  // Database State (Managed off-thread via Web Worker)
  const [dbProgress, setDbProgress] = useState<number>(0);
  const [dbLoaded, setDbLoaded] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [latestYear, setLatestYear] = useState<number>(2025);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const workerRef = useRef<Worker | null>(null);

  // Form Inputs
  const [homeState, setHomeState] = useState<string>('');
  const [predictionMode, setPredictionMode] = useState<PredictionMode>('');
  const [category, setCategory] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [gender, setGender] = useState<string>('');
  
  const [mainCrl, setMainCrl] = useState<string>('');
  const [mainCategoryRank, setMainCategoryRank] = useState<string>('');
  const [advCrl, setAdvCrl] = useState<string>('');
  const [advCategoryRank, setAdvCategoryRank] = useState<string>('');

  // Search Results
  const [allPredictions, setAllPredictions] = useState<Prediction[]>([]);
  const [hasPredicted, setHasPredicted] = useState<boolean>(false);
  const [queryTimeMs, setQueryTimeMs] = useState<number>(0);

  // Interactive Live Filters
  const [selectedInstType, setSelectedInstType] = useState<string>('ALL'); // ALL, IIT, NIT, IIIT, GFTI
  const [searchBranch, setSearchBranch] = useState<string>('');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedProbs, setSelectedProbs] = useState<('High' | 'Medium' | 'Low')[]>(['High', 'Medium', 'Low']);
  const [showStatesDropdown, setShowStatesDropdown] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'predictions' | 'wishlist'>('predictions');
  const [activeExamTab, setActiveExamTab] = useState<'advanced' | 'mains'>('mains');
  const [showAll, setShowAll] = useState<boolean>(false);
  const [activeTooltipKey, setActiveTooltipKey] = useState<string | null>(null);

  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveTooltipKey(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // Local Wishlist (Persistent in localStorage)
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('jee_predictor_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Process Query Results in Main Thread (offloading SQL execution from UI)
  function processQueryResults(rawRows: CutoffRow[], inputs: QueryInputs) {
    const finalPredictions = predictChoices(rawRows, inputs);

    setAllPredictions(finalPredictions);
    setHasPredicted(true);
    setIsQuerying(false);
    setQueryTimeMs(Math.round(performance.now() - inputs.queryStart));
    
    // Auto-select active exam tab based on rank inputs
    if (inputs.advCrl) {
      setActiveExamTab('advanced');
    } else {
      setActiveExamTab('mains');
    }
    setActiveTab('predictions');
  }

  // Sync wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('jee_predictor_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync dark theme to document root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Reset showAll when query results or filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowAll(false);
  }, [allPredictions, activeTab, selectedInstType, selectedStates, searchBranch, selectedProbs]);

  // Load and configure Web Worker
  useEffect(() => {
    // Instantiate Web Worker using classic worker constructor URL syntax to support importScripts
    const worker = new Worker(new URL('./db.worker.ts', import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const { type, payload } = e.data;
      
      if (type === 'PROGRESS') {
        setDbProgress(payload);
      } else if (type === 'READY') {
        if (payload && payload.maxYear) {
          setLatestYear(payload.maxYear);
        }
        setDbLoaded(true);
      } else if (type === 'ERROR') {
        setDbError(payload);
      } else if (type === 'QUERY_RESULTS') {
        processQueryResults(payload.rows, payload.inputs);
      } else if (type === 'QUERY_ERROR') {
        alert("Database error: " + payload);
        setIsQuerying(false);
      }
    };

    // Resolve the absolute database URL relative to the current base path
    const dbUrl = new URL('./cutoffs.db', window.location.href).href;
    // Initialize worker database load
    worker.postMessage({ type: 'INIT', payload: { dbUrl } });

    return () => {
      worker.terminate();
    };
  }, []);

  // Toggle wishlist item
  const toggleWishlist = (key: string) => {
    setWishlist(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Trigger Off-Thread Prediction Query
  const handlePredict = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!workerRef.current || !dbLoaded) return;

    if (!agreeTerms) {
      alert("You must agree to the Terms & Conditions before running predictions.");
      return;
    }

    if (!homeState) {
      alert("Please select your Home State / UT.");
      return;
    }

    if (!category) {
      alert("Please select your Seat Category.");
      return;
    }

    if (!gender) {
      alert("Please select your Gender Pool.");
      return;
    }

    if (!predictionMode) {
      alert("Please select a Prediction Basis.");
      return;
    }

    const parsedMainCrl = parseInt(mainCrl, 10);
    if (isNaN(parsedMainCrl) || parsedMainCrl <= 0) {
      alert("Please enter a valid JEE Main CRL Rank.");
      return;
    }

    if (category !== 'OPEN') {
      const parsedMainCat = parseInt(mainCategoryRank, 10);
      if (isNaN(parsedMainCat) || parsedMainCat <= 0) {
        alert("Please enter a valid JEE Main Category Rank.");
        return;
      }
    }

    setIsQuerying(true);
    
    // Pivoted SQL query retrieves all candidate cutoff rows matching category, gender, and quotas
    const sqlQuery = `
      SELECT
        c.counselling_board,
        c.institute_id,
        i.name as institute_name,
        i.type as institute_type,
        c.program_id,
        p.name as program_name,
        CASE
          WHEN c.quota IN ('HS', 'Home State', 'Home State for Goa') THEN 'Home State'
          WHEN c.quota IN ('OS', 'Other State') THEN 'Other State'
          WHEN c.quota IN ('AI', 'All India') THEN 'All India'
          WHEN c.quota IN ('JK', 'Jammu & Kashmir (UT)') THEN 'Jammu & Kashmir (UT)'
          WHEN c.quota IN ('LA', 'Ladakh (UT)') THEN 'Ladakh (UT)'
          WHEN c.quota = 'GO' THEN 'Goa'
          ELSE c.quota
        END as quota,
        c.category,
        c.gender,
        c.rank_type,
        MAX(CASE WHEN c.year = ${latestYear} THEN c.closing_rank END) as closing_latest,
        MAX(CASE WHEN c.year = ${latestYear} AND c.round_no = 1 THEN c.closing_rank END) as round1_latest,
        MAX(CASE WHEN c.year = ${latestYear - 1} THEN c.closing_rank END) as closing_prev,
        MAX(CASE WHEN c.year = ${latestYear - 2} THEN c.closing_rank END) as closing_before,
        MAX(CASE WHEN c.year = ${latestYear} THEN c.round_no END) as last_round_latest,
        MAX(CASE WHEN c.year = ${latestYear - 1} THEN c.round_no END) as last_round_prev,
        MAX(CASE WHEN c.year = ${latestYear - 2} THEN c.round_no END) as last_round_before
      FROM cutoffs c
      JOIN institutes i ON c.institute_id = i.id
      JOIN programs p ON c.program_id = p.id
      WHERE
        -- Gender pool: females qualify for both female-only and gender-neutral seats
        (c.gender = 'Gender-Neutral' OR (:is_female = 1 AND c.gender = 'Female-only (including Supernumerary)'))
        -- Category mapping: reserved candidates qualify for open seats as well
        AND (c.category = 'OPEN' OR c.category = :category)
        -- Normal seat allocations
        AND c.quota IN ('AI', 'All India', 'HS', 'Home State', 'OS', 'Other State', 'GO', 'JK', 'LA', 'Jammu & Kashmir (UT)', 'Ladakh (UT)')
        -- Exclude B.Arch (AAT / Paper-2) and B.Planning (Paper-2) programs
        AND p.name NOT LIKE '%Bachelor of Architecture%'
        AND p.name NOT LIKE '%Bachelor of Planning%'
      GROUP BY c.counselling_board, c.institute_id, c.program_id,
        CASE
          WHEN c.quota IN ('HS', 'Home State', 'Home State for Goa') THEN 'Home State'
          WHEN c.quota IN ('OS', 'Other State') THEN 'Other State'
          WHEN c.quota IN ('AI', 'All India') THEN 'All India'
          WHEN c.quota IN ('JK', 'Jammu & Kashmir (UT)') THEN 'Jammu & Kashmir (UT)'
          WHEN c.quota IN ('LA', 'Ladakh (UT)') THEN 'Ladakh (UT)'
          WHEN c.quota = 'GO' THEN 'Goa'
          ELSE c.quota
        END,
        c.category, c.gender, c.rank_type
    `;

    workerRef.current.postMessage({
      type: 'QUERY',
      payload: {
        sql: sqlQuery,
        params: {
          ':is_female': gender === 'Female-only (including Supernumerary)' ? 1 : 0,
          ':category': category
        },
        inputs: {
          mainCrl,
          mainCategoryRank,
          advCrl,
          advCategoryRank,
          homeState,
          category,
          gender,
          latestYear,
          predictionMode,
          queryStart: performance.now()
        }
      }
    });
  };

  // Auto-reload predictions when predictionMode changes and predictions have already been run
  useEffect(() => {
    if (hasPredicted && dbLoaded && workerRef.current) {
      handlePredict();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictionMode]);

  // Filter & Search predictions in memory (instantaneous interactive filters)
  const filteredPredictions = useMemo(() => {
    let list = allPredictions;

    // Filter by Active Exam Tab if Advanced rank is provided
    if (advCrl) {
      if (activeExamTab === 'advanced') {
        list = list.filter(p => p.institute_type === 'IIT' || p.institute_type === 'IISc');
      } else {
        list = list.filter(p => p.institute_type !== 'IIT' && p.institute_type !== 'IISc');
      }
    }

    // Starred Wishlist tab
    if (activeTab === 'wishlist') {
      list = list.filter(p => wishlist.includes(p.uniqueKey));
    }

    // Institute Type filters
    if (selectedInstType !== 'ALL') {
      list = list.filter(p => p.institute_type === selectedInstType);
    }

    // State Location multi-select filters
    if (selectedStates.length > 0) {
      list = list.filter(p => {
        const instInfo = INSTITUTE_STATE_MAP[p.institute_id];
        return instInfo && selectedStates.includes(instInfo.state);
      });
    }

    // Filter by probability status
    list = list.filter(p => selectedProbs.includes(p.status));

    // Fuzzy branch text search
    if (searchBranch.trim()) {
      const q = searchBranch.toLowerCase();
      list = list.filter(p => 
        p.program_name.toLowerCase().includes(q) ||
        p.institute_name.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allPredictions, activeTab, selectedInstType, selectedStates, searchBranch, wishlist, activeExamTab, advCrl, selectedProbs]);

  const advancedPredictionsCount = activeTab === 'wishlist' 
    ? allPredictions.filter(p => (p.institute_type === 'IIT' || p.institute_type === 'IISc') && wishlist.includes(p.uniqueKey)).length
    : allPredictions.filter(p => p.institute_type === 'IIT' || p.institute_type === 'IISc').length;

  const mainsPredictionsCount = activeTab === 'wishlist'
    ? allPredictions.filter(p => p.institute_type !== 'IIT' && p.institute_type !== 'IISc' && wishlist.includes(p.uniqueKey)).length
    : allPredictions.filter(p => p.institute_type !== 'IIT' && p.institute_type !== 'IISc').length;

  const toggleProbabilityFilter = (prob: 'High' | 'Medium' | 'Low') => {
    setSelectedProbs(prev => 
      prev.includes(prob) 
        ? prev.filter(p => p !== prob) 
        : [...prev, prob]
    );
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} transition-colors duration-200`}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans">
        
        {/* HEADER */}
        <Header
          dbLoaded={dbLoaded}
          dbError={dbError}
          dbProgress={dbProgress}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* DATABASE DOWNLOADING OVERLAY */}
        {!dbLoaded && !dbError && (
          <DbLoader dbProgress={dbProgress} />
        )}

        {/* DB ERROR SCREEN */}
        {dbError && (
          <DbError dbError={dbError} />
        )}

        {/* MAIN APPLICATION CONTAINER */}
        {dbLoaded && (
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
            
            {/* SIDEBAR INPUT PANEL */}
            <SidebarForm
              homeState={homeState}
              setHomeState={setHomeState}
              category={category}
              setCategory={setCategory}
              gender={gender}
              setGender={setGender}
              predictionMode={predictionMode}
              setPredictionMode={setPredictionMode}
              mainCrl={mainCrl}
              setMainCrl={setMainCrl}
              mainCategoryRank={mainCategoryRank}
              setMainCategoryRank={setMainCategoryRank}
              advCrl={advCrl}
              setAdvCrl={setAdvCrl}
              advCategoryRank={advCategoryRank}
              setAdvCategoryRank={setAdvCategoryRank}
              agreeTerms={agreeTerms}
              setAgreeTerms={setAgreeTerms}
              handlePredict={handlePredict}
              dbLoaded={dbLoaded}
              latestYear={latestYear}
            />

            {/* RESULTS CONTENT PANEL */}
            <section className="lg:col-span-8 space-y-6 flex flex-col min-h-[500px]">
              
              {/* INTERACTIVE FILTERS STICKY MODULE */}
              <Filters
                hasPredicted={hasPredicted}
                allPredictionsCount={allPredictions.length}
                wishlistCount={allPredictions.filter(p => wishlist.includes(p.uniqueKey)).length}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                queryTimeMs={queryTimeMs}
                advCrl={advCrl}
                activeExamTab={activeExamTab}
                setActiveExamTab={setActiveExamTab}
                searchBranch={searchBranch}
                setSearchBranch={setSearchBranch}
                selectedStates={selectedStates}
                setSelectedStates={setSelectedStates}
                showStatesDropdown={showStatesDropdown}
                setShowStatesDropdown={setShowStatesDropdown}
                selectedInstType={selectedInstType}
                setSelectedInstType={setSelectedInstType}
                selectedProbs={selectedProbs}
                toggleProbabilityFilter={toggleProbabilityFilter}
                advancedPredictionsCount={advancedPredictionsCount}
                mainsPredictionsCount={mainsPredictionsCount}
              />

              {/* RESULTS LIST / MAIN DISPLAY AREA */}
              {isQuerying ? (
                // Off-Thread Querying Loader
                <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 shadow-sm space-y-4">
                  <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Evaluating cutoffs...</h3>
                  <p className="text-sm text-slate-400 max-w-xs">
                    Scanning historical rounds and computing success probabilities in a background worker thread.
                  </p>
                </div>
              ) : !hasPredicted ? (
                // Dashboard Welcome State
                <div className="flex-1 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-4 bg-white/40 dark:bg-slate-900/10 backdrop-blur-sm">
                  <div className="p-3.5 sm:p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                    <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-brand-500" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <h3 className="text-base sm:text-lg font-bold">Predict Your Admission Options</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Enter your JEE Main and Advanced ranks on the left, then click "Predict Choices" to load matching historical engineering branches.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg mt-4">
                    <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">100% Client-Side</div>
                      <div className="text-slate-400 text-[11px]">No trackers, no data collection. Zero signups.</div>
                    </div>
                    <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">Weighted Scoring</div>
                      <div className="text-slate-400 text-[11px]">Latest years are heavily weighted for accuracy.</div>
                    </div>
                    <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">Star Wishlist</div>
                      <div className="text-slate-400 text-[11px]">Star targets to create persistent target choice list.</div>
                    </div>
                  </div>
                </div>
              ) : filteredPredictions.length === 0 ? (
                // No Matching Results
                <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 shadow-sm">
                  <Info className="h-10 w-10 text-slate-400 mb-3" />
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">No Matching Choices Found</h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1">
                    Try entering slightly higher ranks, selecting a different seat category, adjusting the location/state filter, or clearing search.
                  </p>
                </div>
              ) : (
                // RESULTS GRID (FLAT CARD LAYOUT)
                <div className="space-y-4">
                  {(showAll ? filteredPredictions : filteredPredictions.slice(0, 15)).map(pred => (
                    <PredictionCard
                      key={pred.uniqueKey}
                      pred={pred}
                      wishlist={wishlist}
                      toggleWishlist={toggleWishlist}
                      predictionMode={predictionMode}
                      latestYear={latestYear}
                      activeTooltipKey={activeTooltipKey}
                      setActiveTooltipKey={setActiveTooltipKey}
                    />
                  ))}
                  {filteredPredictions.length > 15 && !showAll && (
                    <div className="text-center pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAll(true)}
                        className="px-6 py-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl font-bold text-xs hover:bg-indigo-600/20 active:scale-98 transition duration-200 cursor-pointer"
                      >
                        Show All {filteredPredictions.length} Choices
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

          </main>
        )}

        {/* FOOTER */}
        <Footer latestYear={latestYear} />

      </div>
    </div>
  );
}
