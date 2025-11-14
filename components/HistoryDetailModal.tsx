import React from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { HistoryEntry } from '../types';
import AnalysisBreakdown from './AnalysisBreakdown';

interface HistoryDetailModalProps {
  entry: HistoryEntry | null;
  onClose: () => void;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 flex items-center justify-between border-b border-gray-700">
            <div>
                <h2 className="text-xl font-bold text-white">Analysis Details</h2>
                <p className="text-sm text-gray-400">{format(new Date(entry.date), "PPP p")}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-400" />
            </button>
        </header>
        <div className="p-6">
            <div className="mb-6 p-4 bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-400">Source</p>
                <p className="font-medium text-white break-all">{entry.sourceName}</p>
                <p className="text-sm text-gray-400 mt-2">Aggregate Risk Score</p>
                <p className="font-bold text-2xl text-white">{entry.aggregateScore.toFixed(0)}%</p>
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">Threat Breakdown</h3>
            <AnalysisBreakdown analysis={entry} />
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailModal;
