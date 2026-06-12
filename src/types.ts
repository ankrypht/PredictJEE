export interface CutoffRow {
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

export interface Prediction extends CutoffRow {
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

export interface QueryInputs {
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

export type PredictionMode = '3-years' | 'latest-only' | '';
