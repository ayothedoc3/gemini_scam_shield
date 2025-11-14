import React, { useState, useEffect } from 'react';
import { PhoneIncoming, Upload, AlertTriangle, ShieldCheck, Trash2, History as HistoryIcon, Bot } from 'lucide-react';
import { format } from 'date-fns';
import type { HistoryEntry } from '../types';
import HistoryDetailModal from './HistoryDetailModal';

const HISTORY_KEY = 'scamShieldHistory';

const getHistory = (): HistoryEntry[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
};

const clearHistoryStorage = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};

const getRiskLevel = (score: number) => {
    if (score >= 85) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
}

const RiskBadge = ({ risk }: { risk: string }) => {
  const styles: { [key: string]: string } = {
    LOW: 'bg-green-500/20 text-green-300',
    MEDIUM: 'bg-yellow-500/20 text-yellow-300',
    HIGH: 'bg-orange-500/20 text-orange-300',
    CRITICAL: 'bg-red-500/20 text-red-300',
  };
  const Icon = risk === 'LOW' ? ShieldCheck : AlertTriangle;
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${styles[risk]}`}>
      <Icon className="w-3.5 h-3.5" />
      {risk}
    </span>
  );
};

const HistoryView: React.FC = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const handleClearHistory = () => {
        if(window.confirm("Are you sure you want to delete all analysis history? This action cannot be undone.")) {
            clearHistoryStorage();
            setHistory([]);
        }
    }

    const handleShowDetails = (entry: HistoryEntry) => {
        setSelectedEntry(entry);
    }
    const handleCloseModal = () => {
        setSelectedEntry(null);
    }

  return (
    <div className="h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Analysis History</h2>
            {history.length > 0 && (
                 <button 
                    onClick={handleClearHistory}
                    className="flex items-center gap-2 mt-4 sm:mt-0 px-4 py-2 text-sm font-semibold bg-red-600/50 text-red-300 rounded-md hover:bg-red-600/70 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Clear History
                </button>
            )}
        </div>
        <div className="flex-grow bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
        {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
                <HistoryIcon className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300">No History Found</h3>
                <p className="mt-2 max-w-sm">Your analysis reports from live sessions and file uploads will appear here.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                    <tr>
                        <th scope="col" className="px-6 py-3">Source</th>
                        <th scope="col" className="px-6 py-3">Date & Time</th>
                        <th scope="col" className="px-6 py-3">Risk Level</th>
                        <th scope="col" className="px-6 py-3"><span className="sr-only">Details</span></th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((item) => (
                    <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800/60">
                        <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap flex items-center gap-3">
                            {item.source === 'live' ? <PhoneIncoming className="w-4 h-4 text-gray-500"/> : <Upload className="w-4 h-4 text-gray-500"/>}
                            <span className="truncate max-w-xs">{item.sourceName}</span>
                        </th>
                        <td className="px-6 py-4">{format(new Date(item.date), 'yyyy-MM-dd HH:mm')}</td>
                        <td className="px-6 py-4">
                            <RiskBadge risk={getRiskLevel(item.aggregateScore)} />
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => handleShowDetails(item)} className="font-medium text-indigo-400 hover:underline">Details</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
        </div>
        <HistoryDetailModal entry={selectedEntry} onClose={handleCloseModal} />
    </div>
  );
};

export default HistoryView;
