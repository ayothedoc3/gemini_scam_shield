export interface TranscriptEntry {
  timestamp: string;
  text: string;
  speaker: 'user' | 'model' | 'system' | 'caller';
}

export interface AnalysisMethodResult {
  score: number;
  reason: string;
}

export interface ContextualAnalysisResult extends AnalysisMethodResult {
  keywords: string[];
}

export interface DetailedAnalysis {
  spectral: AnalysisMethodResult;
  biometric: AnalysisMethodResult;
  contextual: ContextualAnalysisResult;
  intelligence: AnalysisMethodResult;
  aggregateScore: number;
}

export interface HistoryEntry extends DetailedAnalysis {
  id: string;
  date: string;
  source: 'live' | 'upload';
  sourceName: string; // e.g., "Live Session" or the file name
}

export interface TimelineDataPoint {
  timestamp: string;
  riskScore: number;
  time: number;
}
