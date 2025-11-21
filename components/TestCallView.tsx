import React, { useState, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import useScamShield from '../hooks/useScamShield';
import RiskMeter from './RiskMeter';
import AnalysisBreakdown from './AnalysisBreakdown';
import LiveTranscript from './LiveTranscript';
import AlertModal from './AlertModal';

const TestCallView: React.FC = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [testScenario, setTestScenario] = useState<'ceo-fraud' | 'tech-support' | 'irs' | 'legitimate'>('ceo-fraud');
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const {
    isActive,
    analysis,
    transcript,
    showAlert,
    error,
    startDetection,
    stopDetection,
  } = useScamShield();

  const testScenarios = {
    'ceo-fraud': {
      name: 'CEO Fraud Attack',
      script: 'Hello, this is John from the executive office. We have an urgent wire transfer that needs to be processed immediately. The CEO has authorized a payment of $50,000 to our new vendor. Please process this right away and bypass the usual approval process due to time sensitivity.',
      riskLevel: 'CRITICAL'
    },
    'tech-support': {
      name: 'Tech Support Scam',
      script: 'Hi, this is Microsoft technical support. We detected suspicious activity on your computer. Your system has been compromised with malware. We need remote access to fix this immediately. Please download our software and provide your credit card for a security deposit.',
      riskLevel: 'HIGH'
    },
    'irs': {
      name: 'IRS Impersonation',
      script: 'This is Agent Smith from the IRS. You have outstanding tax debt of $12,000. If you do not pay immediately, a warrant will be issued for your arrest. You can settle this now with a wire transfer or gift cards to avoid legal action.',
      riskLevel: 'HIGH'
    },
    'legitimate': {
      name: 'Legitimate Call',
      script: 'Hi, this is Sarah from accounting. I wanted to follow up on the invoice we sent last week. Could you please confirm when we can expect payment? Let me know if you have any questions about the details. Thanks!',
      riskLevel: 'LOW'
    }
  };

  const startTestCall = async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setLocalStream(stream);
      setIsCallActive(true);

      // Start CallGuard detection
      await startDetection();

      // Simulate the scam scenario audio
      simulateScamCall();
    } catch (err) {
      console.error('Error starting test call:', err);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const simulateScamCall = () => {
    // Use Text-to-Speech to simulate the scam call
    const utterance = new SpeechSynthesisUtterance(testScenarios[testScenario].script);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Select a voice that sounds more artificial (for testing deepfake detection)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices[0]; // Use first available voice
    }

    window.speechSynthesis.speak(utterance);
  };

  const endTestCall = () => {
    // Stop CallGuard detection
    stopDetection();

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Stop any ongoing speech synthesis
    window.speechSynthesis.cancel();

    setIsCallActive(false);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, [localStream]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Test Call Simulator
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Simulate different scam scenarios to test CallGuard's detection capabilities
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 dark:bg-red-500/10 border border-red-500 text-red-700 dark:text-red-300 p-4 rounded-xl">
          <p className="font-bold">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Call Controls */}
        <div className="space-y-6">
          {/* Scenario Selection */}
          {!isCallActive && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Select Test Scenario
              </h2>
              <div className="space-y-3">
                {Object.entries(testScenarios).map(([key, scenario]) => (
                  <button
                    key={key}
                    onClick={() => setTestScenario(key as any)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                      testScenario === key
                        ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          {scenario.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {scenario.script}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        scenario.riskLevel === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                          : scenario.riskLevel === 'HIGH'
                          ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300'
                          : 'bg-green-500/20 text-green-700 dark:text-green-300'
                      }`}>
                        {scenario.riskLevel}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Call Controls */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <div className="text-center space-y-6">
              {isCallActive && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      Test Call Active
                    </span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-900/50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Scenario: {testScenarios[testScenario].name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      CallGuard is analyzing this call in real-time...
                    </p>
                  </div>
                </div>
              )}

              {/* Main Call Button */}
              <button
                onClick={isCallActive ? endTestCall : startTestCall}
                className={`w-full flex items-center justify-center gap-3 py-6 px-8 rounded-2xl text-lg font-black transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl ${
                  isCallActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/50'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-500/50'
                }`}
              >
                {isCallActive ? (
                  <>
                    <PhoneOff className="w-7 h-7" />
                    <span>End Test Call</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-7 h-7" />
                    <span>Start Test Call</span>
                  </>
                )}
              </button>

              {/* Secondary Controls */}
              {isCallActive && (
                <div className="flex gap-4">
                  <button
                    onClick={toggleMute}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      isMuted
                        ? 'bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-500/30'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Risk Meter */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <RiskMeter score={analysis.aggregateScore} isActive={isActive} />
          </div>
        </div>

        {/* Right Column - Analysis */}
        <div className="space-y-6">
          {/* Analysis Breakdown */}
          {analysis && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Detection Analysis
              </h2>
              <AnalysisBreakdown analysis={analysis} isActive={isActive} />
            </div>
          )}

          {/* Live Transcript */}
          {transcript && transcript.length > 0 && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Live Transcript
              </h2>
              <LiveTranscript transcript={transcript} />
            </div>
          )}

          {/* Instructions */}
          {!isCallActive && (
            <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border border-indigo-300 dark:border-indigo-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    How Test Calling Works
                  </h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">1.</span>
                      <span>Select a scam scenario from the options above</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">2.</span>
                      <span>Click "Start Test Call" to begin the simulation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">3.</span>
                      <span>Watch CallGuard detect and analyze the scam in real-time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">4.</span>
                      <span>See risk scores, transcript, and threat analysis</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 p-3 bg-white/50 dark:bg-gray-900/30 rounded-lg">
                    <strong>Note:</strong> This uses text-to-speech to simulate the scam call.
                    For realistic testing, use the Upload feature with actual recorded scam calls.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Modal */}
      {showAlert && <AlertModal />}
    </div>
  );
};

export default TestCallView;
