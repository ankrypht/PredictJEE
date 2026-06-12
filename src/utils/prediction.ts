import { INSTITUTE_STATE_MAP, type InstituteInfo } from '../data/instituteStateMap';
import type { CutoffRow, Prediction, QueryInputs } from '../types';

/**
 * Quota eligibility validator (with support for Home State candidate dual quota pooling)
 */
export function isQuotaEligible(row: CutoffRow, userHomeState: string): boolean {
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

/**
 * Processes cutoff rows and ranks to calculate admission success predictions,
 * WCR, SDI, filters out duplicates, and sorts predictions.
 */
export function predictChoices(rawRows: CutoffRow[], inputs: QueryInputs): Prediction[] {
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

  return finalPredictions;
}
