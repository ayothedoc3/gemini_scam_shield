import React from 'react';
import { Phone, PhoneOff, Mic, MicOff, Info } from 'lucide-react';
import useScamShield from '../hooks/useScamShield';
import RiskMeter from './RiskMeter';
import LiveTranscript from './LiveTranscript';
import AlertModal from './AlertModal';
import AnalysisBreakdown from './AnalysisBreakdown';

const UsageInstructions = () => (
  <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 flex items-start gap-3 text-sm mt-4">
    <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
    <div className="text-gray-300">
      <span className="font-bold text-white">How it works:</span> For live protection, place your call on <span className="font-bold">speakerphone</span>. Due to your device's security policies, Scam Shield can only analyze audio through the microphone and cannot directly access phone or app calls.
    </div>
  </div>
);

const ProtectView: React.FC = () => {
  const {
    isActive,
    isStarting,
    analysis,
    transcript,
    showAlert,
    error,
    startDetection,
    stopDetection,
  } = useScamShield();

  return (
    <div className="flex flex-col gap-6 h-full">
      {error && (
         <div className="bg-red-500/20 text-red-300 p-4 rounded-lg border border-red-500/50">
           <p className="font-bold">An error occurred:</p>
           <p className="text-sm">{error}</p>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
        <div className="lg:col-span-1 flex flex-col justify-between gap-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Live Call Protection</h2>
            <p className="text-gray-400 mb-2">
              {isActive 
                ? "Actively monitoring audio stream for threats." 
                : "Start monitoring to detect voice scams in real-time."}
            </p>
            <UsageInstructions />
          </div>
          <RiskMeter score={analysis.aggregateScore} isActive={isActive} />
          <div className="flex flex-col gap-4">
             <button
                onClick={isActive ? stopDetection : startDetection}
                disabled={isStarting}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-lg font-bold transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                ${isActive
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30'
                }
                `}
                >
                {isStarting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Starting...</span>
                    </>
                ) : isActive ? (
                    <>
                        <PhoneOff className="w-6 h-6" />
                        <span>Stop Protection</span>
                    </>
                ) : (
                    <>
                        <Phone className="w-6 h-6" />
                        <span>Start Protection</span>
                    </>
                )}
            </button>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                {isActive ? <Mic className="w-4 h-4 text-green-400 animate-pulse" /> : <MicOff className="w-4 h-4" />}
                <span>{isActive ? "Microphone is active" : "Microphone is off"}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Threat Analysis Breakdown</h2>
                <AnalysisBreakdown analysis={analysis} />
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col flex-grow">
                <h2 className="text-2xl font-bold text-white mb-4">Live Transcript</h2>
                <LiveTranscript transcript={transcript} keywordsToHighlight={analysis.contextual.keywords} />
            </div>
        </div>
      </div>

      <AlertModal isOpen={showAlert} riskScore={analysis.aggregateScore} />
    </div>
  );
};

export default ProtectView;
