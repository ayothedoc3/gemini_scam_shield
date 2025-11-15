import React from 'react';
// FIX: Import LucideIcon as a type, not as an alias for the Icon component value.
import { Activity, HeartPulse, FileText, BrainCircuit, type LucideIcon } from 'lucide-react';
import type { DetailedAnalysis } from '../types';

interface AnalysisBreakdownProps {
  analysis: DetailedAnalysis;
  isActive?: boolean;
}

const getRiskColor = (score: number): string => {
  if (score >= 85) return 'text-red-400';
  if (score >= 60) return 'text-orange-400';
  if (score >= 30) return 'text-yellow-400';
  if (score > 0) return 'text-green-400';
  return 'text-gray-400';
};

const MethodIndicator: React.FC<{
  Icon: LucideIcon;
  title: string;
  score: number;
  reason: string;
  isActive?: boolean;
}> = ({ Icon, title, score, reason, isActive }) => {
  const color = getRiskColor(score);

  return (
    <div className="flex items-start gap-4">
      <div className={`mt-1 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-700/50 ${color} ${isActive ? 'animate-pulse' : ''}`}>
        <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-baseline">
          <p className="font-semibold text-white">{title}</p>
          <p className={`font-bold text-lg ${color}`}>{score.toFixed(0)}%</p>
        </div>
        <p className="text-sm text-gray-400">{reason}</p>
      </div>
    </div>
  );
};

const AnalysisBreakdown: React.FC<AnalysisBreakdownProps> = ({ analysis, isActive }) => {
  if (!analysis) return null;

  return (
    <div className="space-y-4">
      {isActive && (
        <div className="flex items-center gap-2 text-sm text-indigo-400 mb-2">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
          <span className="animate-pulse">Analyzing audio stream...</span>
        </div>
      )}
      <MethodIndicator
        Icon={Activity}
        title="Spectral Analysis"
        score={analysis.spectral.score}
        reason={analysis.spectral.reason}
        isActive={isActive}
      />
      <MethodIndicator
        Icon={HeartPulse}
        title="Voice Biometric"
        score={analysis.biometric.score}
        reason={analysis.biometric.reason}
        isActive={isActive}
      />
      <MethodIndicator
        Icon={FileText}
        title="Contextual Analysis"
        score={analysis.contextual.score}
        reason={analysis.contextual.reason}
        isActive={isActive}
      />
      <MethodIndicator
        Icon={BrainCircuit}
        title="Audio Intelligence"
        score={analysis.intelligence.score}
        reason={analysis.intelligence.reason}
        isActive={isActive}
      />
    </div>
  );
};

export default AnalysisBreakdown;