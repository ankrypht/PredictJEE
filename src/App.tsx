import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Star,
  Search,
  SlidersHorizontal,
  GraduationCap,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Flame,
  BookOpen,
  Award,
  Info,
  ChevronDown,
  Moon,
  Sun,
  LayoutDashboard,
  Home,
  Building2,
  HelpCircle
} from 'lucide-react';
import { INSTITUTE_STATE_MAP, type InstituteInfo } from './data/instituteStateMap';

// Interface for database rows and prediction results
interface CutoffRow {
  counselling_board: 'JoSAA' | 'CSAB';
  institute_id: number;
  institute_name: string;
  institute_type: 'IIT' | 'NIT' | 'IIIT' | 'GFTI' | 'SFTI' | 'IISc';
  program_id: number;
  program_name: string;
  quota: string;
  category: string;
  gender: string;
  rank_type: 'CRL' | 'Category_Rank';
  closing_latest: number | null;
  round1_latest: number | null;
  closing_prev: number | null;
  closing_before: number | null;
  last_round_latest: number | null;
  last_round_prev: number | null;
  last_round_before: number | null;
}

interface Prediction extends CutoffRow {
  studentRank: number;
  weightedClosingRank: number;
  delta: number;
  status: 'High' | 'Medium' | 'Low';
  probValue: number;
  probabilityText: string;
  uniqueKey: string;
  sdi: number;
  finalSdi: number;
}

// Indian States and UTs for Home State dropdown
const STATES_LIST = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
].sort();

// Seat categories used in JoSAA/CSAB
const CATEGORIES_LIST = [
  "OPEN", "OBC-NCL", "SC", "ST", "EWS",
  "OPEN (PwD)", "OBC-NCL (PwD)", "SC (PwD)", "ST (PwD)", "EWS (PwD)"
];

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
  const [predictionMode, setPredictionMode] = useState<'3-years' | 'latest-only' | ''>('');
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

  // Quota eligibility validator (with support for Home State candidate dual quota pooling)
  function isQuotaEligible(row: CutoffRow, userHomeState: string): boolean {
    const instInfo: InstituteInfo | undefined = INSTITUTE_STATE_MAP[row.institute_id];
    if (!instInfo) return false;

    const instState = instInfo.state;
    const q = row.quota;

    // All India Quota: always eligible
    if (q === 'AI' || q === 'All India') return true;

    // Home State Quota: eligible if the candidate's home state matches the college state
    if (q === 'HS' || q === 'Home State' || q === 'Home State for Goa') {
      return instState === userHomeState;
    }

    // Other State Quota: eligible for candidates outside the state, and also
    // legally eligible for home state candidates competing in the open pool (dual-eligibility)
    if (q === 'OS' || q === 'Other State') {
      return true;
    }

    // Special localized UT quotas
    if (q === 'GO' || q === 'Goa') return userHomeState === 'Goa';
    if (q === 'JK' || q === 'Jammu & Kashmir (UT)') return userHomeState === 'Jammu & Kashmir';
    if (q === 'LA' || q === 'Ladakh (UT)') return userHomeState === 'Ladakh';

    if (q.startsWith('DASA')) return true; // DASA Overseas

    return false;
  }

  interface QueryInputs {
    mainCrl: string;
    mainCategoryRank: string;
    advCrl: string;
    advCategoryRank: string;
    homeState: string;
    category: string;
    gender: string;
    latestYear: number;
    predictionMode: '3-years' | 'latest-only';
    queryStart: number;
  }

  // Process Query Results in Main Thread (offloading SQL execution from UI)
  function processQueryResults(rawRows: CutoffRow[], inputs: QueryInputs) {
    const parsedMainCrl = parseInt(inputs.mainCrl, 10);
    const parsedMainCat = inputs.category !== 'OPEN' ? parseInt(inputs.mainCategoryRank, 10) : null;
    const parsedAdvCrl = inputs.advCrl ? parseInt(inputs.advCrl, 10) : null;
    const parsedAdvCat = (inputs.category !== 'OPEN' && inputs.advCategoryRank) ? parseInt(inputs.advCategoryRank, 10) : null;

    // Build a map of the most competitive (lowest) JoSAA closing rank for each program
    // across all quotas (to use as the objective basis for SDI)
    const programBestClosingMap = new Map<string, number>();
    for (const row of rawRows) {
      if (row.counselling_board === 'JoSAA') {
        const key = `${row.institute_id}-${row.program_id}-${row.category}-${row.gender}-${row.rank_type}`;
        const closingVal = Number(row.closing_latest);
        if (closingVal && !isNaN(closingVal)) {
          const existing = programBestClosingMap.get(key);
          if (existing === undefined || closingVal < existing) {
            programBestClosingMap.set(key, closingVal);
          }
        }
      }
    }

    // Build a map of JoSAA closing_latest ranks for Mains institutes to use for CSAB rows
    const josaaClosingMap = new Map<string, number>();
    for (const row of rawRows) {
      if (row.counselling_board === 'JoSAA' && row.institute_type !== 'IIT' && row.institute_type !== 'IISc') {
        const key = `${row.institute_id}-${row.program_id}-${row.quota}-${row.category}-${row.gender}-${row.rank_type}`;
        if (row.closing_latest !== null && row.closing_latest !== undefined) {
          josaaClosingMap.set(key, Number(row.closing_latest));
        }
      }
    }

    // Build a map of the most competitive (lowest) JoSAA OPEN CRL closing rank for each branch and gender
    // across all quotas (to serve as the objective, category-agnostic basis for SDI)
    const branchOpenCRLMap = new Map<string, number>();
    for (const row of rawRows) {
      if (row.counselling_board === 'JoSAA' && row.category === 'OPEN' && row.rank_type === 'CRL') {
        const key = `${row.institute_id}-${row.program_id}-${row.gender}`;
        const closingVal = Number(row.closing_latest);
        if (closingVal && !isNaN(closingVal)) {
          const existing = branchOpenCRLMap.get(key);
          if (existing === undefined || closingVal < existing) {
            branchOpenCRLMap.set(key, closingVal);
          }
        }
      }
    }

    // Find the max closing ranks dynamically from JoSAA data (and IIT data) for normalization,
    // but filter out anomalous/extremely high outlier ranks to prevent score squishing.
    // Since SDI is calculated using only the OPEN CRL ranks, we only need CRL max ranks.
    let maxIIT_CRL = 1;
    let maxMain_CRL = 1;

    for (const row of rawRows) {
      const closingVal = Number(row.closing_latest);
      if (!closingVal || isNaN(closingVal)) continue;

      const isAdvanced = row.institute_type === 'IIT' || row.institute_type === 'IISc';
      if (isAdvanced) {
        if (row.rank_type === 'CRL') {
          if (closingVal <= 40000 && closingVal > maxIIT_CRL) {
            maxIIT_CRL = closingVal;
          }
        }
      } else {
        if (row.counselling_board === 'JoSAA') {
          if (row.rank_type === 'CRL') {
            if (closingVal <= 250000 && closingVal > maxMain_CRL) {
              maxMain_CRL = closingVal;
            }
          }
        }
      }
    }

    const finalMaxIIT_CRL = maxIIT_CRL > 1 ? maxIIT_CRL : 25000;
    const finalMaxMain_CRL = maxMain_CRL > 1 ? maxMain_CRL : 100000;

    const predictions: Prediction[] = [];

    for (const row of rawRows) {
      // 1. Quota State Matching
      if (!isQuotaEligible(row, inputs.homeState)) continue;

      // 2. Strict Exam Routing (IIT Advanced vs Main NIT/IIIT/GFTI)
      const isIIT = row.institute_type === 'IIT';
      let studentRank: number | null = null;

      if (isIIT) {
        if (parsedAdvCrl === null) continue; // Exclude IIT if no Advanced CRL entered
        
        if (row.rank_type === 'CRL') {
          studentRank = parsedAdvCrl;
        } else if (row.rank_type === 'Category_Rank') {
          if (parsedAdvCat === null) continue; // Exclude reserved IIT if Advanced Category Rank is missing
          studentRank = parsedAdvCat;
        }
      } else {
        if (row.rank_type === 'CRL') {
          studentRank = parsedMainCrl;
        } else if (row.rank_type === 'Category_Rank') {
          if (parsedMainCat === null) continue;
          studentRank = parsedMainCat;
        }
      }

      if (studentRank === null || isNaN(studentRank) || studentRank <= 0) continue;

      // 3. Compute closing rank / weighted closing rank (WCR)
      const cLatest = row.closing_latest;
      const cPrev = row.closing_prev;
      const cBefore = row.closing_before;

      // EXCLUSION FILTER: Must have data in the latest academic year to filter discontinued branches
      if (cLatest === null || cLatest === undefined) continue;

      const wcr = (() => {
        if (inputs.predictionMode === 'latest-only') {
          return cLatest;
        } else {
          // Weights: Latest (70%), Prev (20%), Before (10%) normalized if gaps exist (e.g. new programs)
          const wLatest = 0.7;
          const wPrev = 0.2;
          const wBefore = 0.1;
          let totalW = 0;
          if (cLatest !== null) totalW += wLatest;
          if (cPrev !== null) totalW += wPrev;
          if (cBefore !== null) totalW += wBefore;

          if (totalW === 0) return 0;

          const nwLatest = cLatest !== null ? wLatest / totalW : 0;
          const nwPrev = cPrev !== null ? wPrev / totalW : 0;
          const nwBefore = cBefore !== null ? wBefore / totalW : 0;

          return Math.round(
            nwLatest * (cLatest || 0) +
            nwPrev * (cPrev || 0) +
            nwBefore * (cBefore || 0)
          );
        }
      })();

      if (wcr === 0) continue;

      // 4. Mathematical Percentage-based Boundary Buffers (10% buffer)
      if (studentRank > wcr * 1.10) continue;

      // Delta percentage calculation
      const delta = (studentRank - wcr) / wcr;
      
      const { status, probValue, probabilityText } = (() => {
        if (delta <= -0.05) {
          const val = Math.min(99, Math.round(85 + (Math.abs(delta) * 100)));
          return { status: 'High' as const, probValue: val, probabilityText: 'High Probability' };
        } else if (delta <= 0.02) {
          const val = Math.round(50 + ((0.02 - delta) / 0.07) * 35);
          return { status: 'Medium' as const, probValue: val, probabilityText: 'Medium Probability' };
        } else {
          const val = Math.max(5, Math.round(10 + ((0.10 - delta) / 0.08) * 40));
          return { status: 'Low' as const, probValue: val, probabilityText: 'Low Probability' };
        }
      })();

      const uniqueKey = `${row.counselling_board}-${row.institute_id}-${row.program_id}-${row.quota}-${row.category}-${row.gender}-${row.rank_type}`;

      // Calculate a dynamic 'Smart Desirability Index' (SDI) score on the frontend using only the latest year's data
      const isAdvanced = isIIT || row.institute_type === 'IISc';
      
      // Determine the JoSAA OPEN CRL rank for this branch (institute_id + program_id) to use as the sole basis for SDI
      let sdiRank = 0;
      
      const openKeyWithGender = `${row.institute_id}-${row.program_id}-${row.gender}`;
      const openKeyGenderNeutral = `${row.institute_id}-${row.program_id}-Gender-Neutral`;
      
      const openRank = branchOpenCRLMap.get(openKeyWithGender) ?? branchOpenCRLMap.get(openKeyGenderNeutral);
      
      if (openRank !== undefined) {
        sdiRank = openRank;
      } else {
        // Fallback: If no JoSAA OPEN CRL row is found (extremely rare), calculate the baseline closing rank for this row
        let fallbackClosing = Number(row.closing_latest) || 0;
        if (row.counselling_board === 'CSAB') {
          // Keep JoSAA alignment for CSAB fallback
          const josaaKey = `${row.institute_id}-${row.program_id}-${row.quota}-${row.category}-${row.gender}-${row.rank_type}`;
          const josaaClosing = josaaClosingMap.get(josaaKey);
          if (josaaClosing !== undefined) {
            fallbackClosing = josaaClosing;
          }
        }
        
        // Quota normalization fallback
        const objectiveKey = `${row.institute_id}-${row.program_id}-${row.category}-${row.gender}-${row.rank_type}`;
        const bestClosingVal = programBestClosingMap.get(objectiveKey);
        sdiRank = bestClosingVal !== undefined ? bestClosingVal : fallbackClosing;
      }

      // Step A (Base Competitiveness Normalization using square root ratio for natural spread)
      // Since sdiRank represents the OPEN CRL rank, we always normalize it against the CRL max rank.
      const baseScore = (() => {
        if (isAdvanced) {
          const maxRank = finalMaxIIT_CRL;
          const ratio = Math.min(1, Math.max(0, sdiRank / maxRank));
          return (1 - Math.sqrt(ratio)) * 100;
        } else {
          const maxRank = finalMaxMain_CRL;
          const ratio = Math.min(1, Math.max(0, sdiRank / maxRank));
          return (1 - Math.sqrt(ratio)) * 100;
        }
      })();

      // Final_SDI is purely the base score now (no tier premium)
      const finalSdi = baseScore;

      predictions.push({
        ...row,
        studentRank,
        weightedClosingRank: wcr,
        delta,
        status,
        probValue,
        probabilityText,
        uniqueKey,
        sdi: finalSdi,
        finalSdi
      });
    }

    // Filter out CSAB predictions if the corresponding JoSAA prediction is already obtainable
    const josaaKeys = new Set<string>();
    for (const pred of predictions) {
      if (pred.counselling_board === 'JoSAA') {
        const key = `${pred.institute_id}-${pred.program_id}-${pred.quota}-${pred.category}-${pred.gender}-${pred.rank_type}`;
        josaaKeys.add(key);
      }
    }
    const filteredPredictionsList = predictions.filter(pred => {
      if (pred.counselling_board === 'CSAB') {
        const key = `${pred.institute_id}-${pred.program_id}-${pred.quota}-${pred.category}-${pred.gender}-${pred.rank_type}`;
        if (josaaKeys.has(key)) {
          return false;
        }
      }
      return true;
    });

    // 5. Best Pathway Deduplication & Home State Dual-Quota Selection
    // If a candidate matches both Home State and Other State quotas, or OPEN and Category seats,
    // we choose the seat quota and category offering the higher admission probability (higher probValue)
    const bestQuotaMap = new Map<string, Prediction>();
    for (const pred of filteredPredictionsList) {
      const groupKey = `${pred.counselling_board}-${pred.institute_id}-${pred.program_id}-${pred.gender}`;
      const existing = bestQuotaMap.get(groupKey);
      if (!existing) {
        bestQuotaMap.set(groupKey, pred);
      } else {
        // Keep the one with the higher probability (higher probValue)
        if (pred.probValue > existing.probValue) {
          bestQuotaMap.set(groupKey, pred);
        }
      }
    }
    const finalPredictions = Array.from(bestQuotaMap.values());

    // Sort by Smart Desirability Index (SDI) DESC using raw, un-clamped Final_SDI
    finalPredictions.sort((a, b) => b.finalSdi - a.finalSdi);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine if category is reserved
  const isReservedCategory = category !== '' && category !== 'OPEN';

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

  const handleStateSelect = (state: string) => {
    setSelectedStates(prev => 
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    );
  };

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
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
                aria-label="Toggle Theme"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* DATABASE DOWNLOADING OVERLAY */}
        {!dbLoaded && !dbError && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900 text-slate-100">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="inline-flex p-4 bg-brand-500/10 text-brand-400 rounded-3xl animate-bounce">
                <GraduationCap className="h-10 w-10 text-brand-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Initializing Database Engine</h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  We are loading the 30 MB historical cutoff database directly to your browser. This download runs only once.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${dbProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-semibold">
                  <span>Downloading cutoffs.db</span>
                  <span>{dbProgress}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DB ERROR SCREEN */}
        {dbError && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-4">
              <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
              <h2 className="text-xl font-bold text-rose-500">Database Engine Error</h2>
              <p className="text-slate-500 dark:text-slate-400">{dbError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* MAIN APPLICATION CONTAINER */}
        {dbLoaded && (
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
            
            {/* SIDEBAR INPUT PANEL */}
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
                        <option value="">-- Select Gender --</option>
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
                      className={`py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer ${
                        predictionMode === '3-years'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      3-Year Weighted
                    </button>
                    <button
                      type="button"
                      onClick={() => setPredictionMode('latest-only')}
                      className={`py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer ${
                        predictionMode === 'latest-only'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
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
                    <Award className="h-4 w-4 mr-1.5 text-indigo-400" />
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
                      <Award className="h-4 w-4 mr-1.5 text-violet-400" />
                      JEE Advanced Ranks (IITs)
                    </h3>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold italic">Optional</span>
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
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 accent-indigo-600 cursor-pointer"
                  />
                  <label htmlFor="agreeTerms" className="text-[10px] sm:text-[11px] leading-snug text-slate-500 dark:text-slate-400 select-none cursor-pointer">
                    I understand this is an indicative predictor based on past counselling cutoffs, and actual 2026 cutoffs may differ. I agree to the <a href="./terms.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Terms &amp; Conditions</a>.
                  </label>
                </div>

                {/* Predict Button */}
                <button
                  type="submit"
                  disabled={!agreeTerms}
                  className="w-full py-2.5 sm:py-3 px-4 mt-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 text-xs sm:text-sm tracking-wide cursor-pointer"
                >
                  Predict Choices
                </button>
              </form>
            </section>

            {/* RESULTS CONTENT PANEL */}
            <section className="lg:col-span-8 space-y-6 flex flex-col min-h-[500px]">
              
              {/* INTERACTIVE FILTERS STICKY MODULE */}
              {hasPredicted && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-4">
                  
                  {/* Results Count & Query Time metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {/* Tabs to toggle All Predicted vs Wishlist */}
                      <button
                        onClick={() => setActiveTab('predictions')}
                        className={`text-xs sm:text-sm font-bold pb-1 transition relative ${
                          activeTab === 'predictions' 
                            ? 'text-brand-500 border-b-2 border-brand-500' 
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                      >
                        All Predictions ({allPredictions.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('wishlist')}
                        className={`text-xs sm:text-sm font-bold pb-1 transition flex items-center ${
                          activeTab === 'wishlist' 
                            ? 'text-brand-500 border-b-2 border-brand-500' 
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                      >
                        <Star className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 ${activeTab === 'wishlist' ? 'fill-brand-500 text-brand-500' : ''}`} />
                        Wishlist ({allPredictions.filter(p => wishlist.includes(p.uniqueKey)).length})
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
                            ? 'bg-white dark:bg-slate-800 text-brand-605 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
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
                            ? 'bg-white dark:bg-slate-800 text-brand-605 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-700/50'
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
                        className="w-full md:w-56 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold"
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
                                  className="text-brand-500 hover:underline"
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
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
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
                          className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border transition ${
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
              )}

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
                  {(showAll ? filteredPredictions : filteredPredictions.slice(0, 15)).map(pred => {
                    const isStarred = wishlist.includes(pred.uniqueKey);
                    const instState = INSTITUTE_STATE_MAP[pred.institute_id]?.state || 'Unknown';

                    return (
                      <div
                        key={pred.uniqueKey}
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
                              <div className={`fixed bottom-4 left-4 right-4 max-w-sm mx-auto mb-0 w-auto translate-x-0 sm:max-w-none sm:absolute sm:bottom-full sm:left-1/2 sm:-translate-x-1/2 sm:mb-2 sm:w-64 p-3 bg-slate-950 dark:bg-slate-900 text-white text-[10px] rounded-xl z-50 shadow-xl border border-slate-800 transition-all duration-205 ${
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
                            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition"
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
                          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-50 dark:bg-slate-905 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl text-center">
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
                  })}
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
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-6 text-left">
              <div className="max-w-md space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">What is WCR (Weighted Closing Rank)?</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  A normalized cutoff calculated from JoSAA/CSAB history. Under 3-Year Weighted basis, WCR weights the latest year at 70%, previous at 20%, and prior at 10%. Under Latest Year Only basis, WCR reflects the exact latest year cutoff.
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
              Created by <span className="font-bold text-indigo-600 dark:text-indigo-400">Ankush</span> &bull; 100% Free &amp; Ad-free College Predictor
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
