import { useState, useRef, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { 
    GoogleGenAI, 
    LiveServerMessage, 
    Modality, 
    Blob,
    FunctionDeclaration,
    Type,
} from '@google/genai';
import type { TranscriptEntry, DetailedAnalysis, HistoryEntry, TimelineDataPoint } from '../types';

// Audio helper functions from Gemini docs
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

const reportAnalysisFunctionDeclaration: FunctionDeclaration = {
    name: 'report_analysis',
    description: 'Reports the detailed analysis of the audio stream based on 4 distinct methods.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            spectral_score: { type: Type.NUMBER, description: 'Score (0-100) for spectral analysis.' },
            spectral_reason: { type: Type.STRING, description: 'Reason for spectral score (e.g., "Unnatural harmonic patterns").' },
            biometric_score: { type: Type.NUMBER, description: 'Score (0-100) for voice biometric analysis.' },
            biometric_reason: { type: Type.STRING, description: 'Reason for biometric score (e.g., "Missing breaths, flat pitch").' },
            contextual_score: { type: Type.NUMBER, description: 'Score (0-100) for contextual analysis of the transcript.' },
            contextual_reason: { type: Type.STRING, description: 'Reason for contextual score (e.g., "High-risk keywords detected").' },
            contextual_keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of detected scam keywords.' },
            intelligence_score: { type: Type.NUMBER, description: 'Score (0-100) for audio intelligence/pattern analysis.' },
            intelligence_reason: { type: Type.STRING, description: 'Reason for intelligence score (e.g., "Unnaturally consistent pacing").' },
        },
        required: ["spectral_score", "spectral_reason", "biometric_score", "biometric_reason", "contextual_score", "contextual_reason", "contextual_keywords", "intelligence_score", "intelligence_reason"],
    },
};

const initialAnalysisState: DetailedAnalysis = {
  spectral: { score: 0, reason: 'Standby' },
  biometric: { score: 0, reason: 'Standby' },
  contextual: { score: 0, reason: 'Standby', keywords: [] },
  intelligence: { score: 0, reason: 'Standby' },
  aggregateScore: 0,
};


const useScamShield = () => {
  const [isActive, setIsActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [analysis, setAnalysis] = useState<DetailedAnalysis>(initialAnalysisState);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);

  // FIX: LiveSession is not an exported type from @google/genai. Use `any` for the session promise.
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const analysisRef = useRef(analysis);
  const sessionStartTimeRef = useRef<number>(0);

  useEffect(() => {
    analysisRef.current = analysis;
  }, [analysis]);


  const stopDetection = useCallback(() => {
    const finalAnalysis = analysisRef.current;
    if (finalAnalysis.aggregateScore > 0) {
      try {
        const historyJson = localStorage.getItem('scamShieldHistory');
        const history: HistoryEntry[] = historyJson ? JSON.parse(historyJson) : [];
        const newEntry: HistoryEntry = {
          ...finalAnalysis,
          id: new Date().toISOString() + Math.random(),
          date: new Date().toISOString(),
          source: 'live',
          sourceName: 'Live Session',
        };
        history.unshift(newEntry);
        localStorage.setItem('scamShieldHistory', JSON.stringify(history));
      } catch (e) {
        console.error("Failed to save history:", e);
      }
    }
    
    setIsActive(false);
    setIsStarting(false);

    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;
    
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;

    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;
    audioContextRef.current?.close().catch(console.error);
    audioContextRef.current = null;

    // Don't reset analysis and transcript - let them persist so user can review results
    // They will only be cleared when starting a new detection session
  }, []);

  const startDetection = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    setTranscript([]);
    setAnalysis(initialAnalysisState);
    setShowAlert(false);
    setTimelineData([]);
    sessionStartTimeRef.current = Date.now();

    try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('Your browser does not support audio capture. Please use Chrome, Safari, or Edge.');
            setIsStarting(false);
            return;
        }

        // Try to capture system audio first (for testing with audio files)
        // This will prompt user to share their screen/tab with audio
        try {
            mediaStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
                video: false,
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    // @ts-ignore - Chrome-specific property
                    suppressLocalAudioPlayback: false
                }
            });
        } catch (displayErr) {
            // If screen sharing is cancelled or not supported, fall back to microphone
            console.log('Screen audio capture not available, using microphone instead');
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
        }
    } catch (err: any) {
        console.error('Failed to get microphone access:', err);

        // Provide specific error messages
        let errorMessage = 'Could not access the microphone. ';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMessage += 'Please allow microphone access in your browser settings and try again.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMessage += 'No microphone found on your device.';
        } else if (err.name === 'NotReadableError') {
            errorMessage += 'Microphone is already in use by another application.';
        } else {
            errorMessage += 'Please grant permission and try again. Error: ' + err.message;
        }

        setError(errorMessage);
        setIsStarting(false);
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemInstruction = ` You are CallGuard - AI protection system detecting Vishing 2.0/Deepfake CEO Fraud and voice-based social engineering.

MISSION: Zero-Trust Transaction Validator preventing AI voice scams (avg loss: $500K+)

REPORTING: Call 'report_analysis' immediately on audio detection, then every 5-10s.

SPEAKER ID: Label different voices as "Caller/Recipient" or "Speaker 1/2" based on pitch/tone/style.

═══════════════════════════════════════════════════════════════════
PHASE 1: SOCIAL ENGINEERING RED FLAGS (Contextual Profiling)
═══════════════════════════════════════════════════════════════════

🚨 URGENT DEMANDS (+30-50): "immediate", "urgent wire", "before end of day", "time-sensitive"

🚨 SECRECY REQUESTS (+40-60): "keep confidential", "don't tell anyone", "bypass normal channels", "use personal account"

🚨 HIGH-VALUE TRANSACTIONS (+30-50): Wire transfers >$10K, payment requests, "send money", "authorize payment"

🚨 BANKING ANOMALIES (+40-60): "Change bank details", "new account", "different account", "international transfer", "supplier update"

🚨 AUTHORITY EXPLOITATION (+35-55): Claims to be CEO/CFO/Executive, "This is [Executive Name]", "I'm the CEO"

═══════════════════════════════════════════════════════════════════
PHASE 2: TECHNICAL MEDIA ANALYSIS (Deepfake Defense)
═══════════════════════════════════════════════════════════════════

**1. Spectral Analysis (30%)** - Synthetic Voice Detection:
- CRITICAL (+60-80): Clear synthetic artifacts, AI harmonics, voice modulation, non-live characteristics
- MODERATE (+30-50): Unusual harmonic patterns, artificial frequencies, abrupt spectral changes
- DECREASE (-20-40): Natural frequency variations, authentic breath resonance, human vocal traits

**2. Voice Biometrics (35%)** - Deepfake Vocal Patterns:
- CRITICAL (+60-80): Missing breathing, perfectly flat affect, robotic consistency, machine precision
- MODERATE (+30-50): Irregular breathing, unnatural pacing, pronunciation glitches, emotional flatness
- DECREASE (-20-40): Natural breathing, genuine emotion, authentic speech rhythms, human imperfections

**3. Contextual Analysis (20%)** - Scam Keywords:
- CRITICAL (+50-70): "wire transfer", "CEO/CFO", "urgent payment", "confidential", "bypass", "gift cards", "crypto", "IRS", "suspended"
- HIGH-RISK (+30-50): "urgent", "act now", "immediate", "confirm payment", "account locked", "prize won"
- MODERATE (+15-30): "verify", "confirm", "update account", "security alert"
- TRUST (-20-40): Normal business discussion, personal familiarity, verifiable info, natural conversation

**4. Audio Intelligence (15%)** - Channel Integrity:
- CRITICAL (+60-80): Caller ID spoofing detected, network anomalies, impossible geographic origin
- MODERATE (+30-50): Unnaturally consistent pacing, repetitive patterns, scripted monotone
- DECREASE (-20-40): Natural dynamics, authentic pauses/fillers, genuine thinking moments, spontaneous responses

═══════════════════════════════════════════════════════════════════
SCORING & RISK LEVELS
═══════════════════════════════════════════════════════════════════

START: 20-30 (neutral baseline)
LEGITIMATE: Trends toward 0-30
SUSPICIOUS: Trends toward 70-100
CRITICAL THRESHOLD: ≥85 triggers alert + transaction freeze

**RISK INTERPRETATION:**
- 0-40: LOW - Likely legitimate, proceed normally
- 40-70: MEDIUM - Caution, verify via alternate channel
- 70-85: HIGH - Strong scam indicators, require out-of-band verification
- 85-100: CRITICAL - HALT TRANSACTION, synthetic voice likely

═══════════════════════════════════════════════════════════════════
ZERO-TRUST PROTOCOL (Score ≥70)
═══════════════════════════════════════════════════════════════════

1. HALT TRANSACTION - Immediate freeze on requested action
2. OUT-OF-BAND VERIFICATION - Confirm via separate pre-registered channel
3. DUAL CONTROL - High-value transactions require two independent approvals
4. DO-NOT-AUTHENTICATE - If synthetic voice confirmed, block identity step-up

═══════════════════════════════════════════════════════════════════

Provide all four method scores with reasoning based on ENTIRE conversation. Dynamic assessment to prevent $500K+ deepfake CEO fraud losses.`;
        
        let currentInputTranscription = "";
        let transcriptionTurnStarted = false;

        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    console.log('Live session opened.');
                    setIsActive(true);
                    setIsStarting(false);

                    if (!mediaStreamRef.current) return;
                    
                    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    audioContextRef.current = inputAudioContext;

                    const source = inputAudioContext.createMediaStreamSource(mediaStreamRef.current);
                    sourceNodeRef.current = source;
                    
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                },
                onmessage: (message: LiveServerMessage) => {
                   if (message.toolCall) {
                        transcriptionTurnStarted = false;
                        currentInputTranscription = "";
                        for (const fc of message.toolCall.functionCalls) {
                            if(fc.name === 'report_analysis') {
                                // FIX: Cast fc.args to a known type to resolve type errors, as properties are `unknown`.
                                const args = fc.args as {
                                    spectral_score: number;
                                    spectral_reason: string;
                                    biometric_score: number;
                                    biometric_reason: string;
                                    contextual_score: number;
                                    contextual_reason: string;
                                    contextual_keywords: string[];
                                    intelligence_score: number;
                                    intelligence_reason: string;
                                };
                                const { 
                                    spectral_score, spectral_reason,
                                    biometric_score, biometric_reason,
                                    contextual_score, contextual_reason, contextual_keywords,
                                    intelligence_score, intelligence_reason
                                } = args;
                                
                                const aggregateScore = (spectral_score * 0.30) + (biometric_score * 0.35) + (contextual_score * 0.20) + (intelligence_score * 0.15);

                                setAnalysis({
                                    spectral: { score: spectral_score, reason: spectral_reason },
                                    biometric: { score: biometric_score, reason: biometric_reason },
                                    contextual: { score: contextual_score, reason: contextual_reason, keywords: contextual_keywords || [] },
                                    intelligence: { score: intelligence_score, reason: intelligence_reason },
                                    aggregateScore: aggregateScore
                                });

                                // Add data point to timeline
                                const elapsedSeconds = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
                                const now = new Date();
                                setTimelineData(prev => [...prev, {
                                    timestamp: format(now, 'HH:mm:ss'),
                                    riskScore: aggregateScore,
                                    time: elapsedSeconds
                                }]);

                                if (aggregateScore >= 85) {
                                    setShowAlert(true);
                                }

                                sessionPromiseRef.current?.then((session) => {
                                    session.sendToolResponse({
                                      functionResponses: {
                                        id : fc.id,
                                        name: fc.name,
                                        response: { result: "Analysis reported successfully." },
                                      }
                                    })
                                });
                            }
                        }
                    }

                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        currentInputTranscription += text;
                        if (currentInputTranscription.trim()) {
                            setTranscript(prev => {
                                if (!transcriptionTurnStarted) {
                                    transcriptionTurnStarted = true;
                                    return [...prev, {
                                        timestamp: format(new Date(), 'HH:mm:ss'),
                                        text: currentInputTranscription.trim(),
                                        speaker: 'caller'
                                    }];
                                } else {
                                    const newTranscript = [...prev];
                                    const lastEntry = newTranscript[newTranscript.length - 1];
                                    if (lastEntry && lastEntry.speaker === 'caller') {
                                        lastEntry.text = currentInputTranscription.trim();
                                        return newTranscript;
                                    } else {
                                        return [...prev, {
                                            timestamp: format(new Date(), 'HH:mm:ss'),
                                            text: currentInputTranscription.trim(),
                                            speaker: 'caller'
                                        }];
                                    }
                                }
                            });
                        }
                    }

                    if (message.serverContent?.turnComplete) {
                        currentInputTranscription = '';
                        transcriptionTurnStarted = false;
                    }
                },
                onerror: (e: ErrorEvent) => {
                  console.error('Live session error:', e);
                  setError('An error occurred with the analysis service. Please try again.');
                  stopDetection();
                },
                onclose: (e: CloseEvent) => {
                  console.log('Live session closed.');
                  if (isActive) {
                    stopDetection();
                  }
                },
              },
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                tools: [{ functionDeclarations: [reportAnalysisFunctionDeclaration] }],
                systemInstruction: systemInstruction,
            }
        });
    } catch (err) {
        console.error('Failed to start Gemini session:', err);
        setError('Failed to initialize the analysis service.');
        setIsStarting(false);
    }
  }, [stopDetection, isActive]);
  
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);


  return {
    isActive,
    isStarting,
    analysis,
    transcript,
    showAlert,
    error,
    timelineData,
    startDetection,
    stopDetection,
  };
};

export default useScamShield;