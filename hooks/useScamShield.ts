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
import type { TranscriptEntry, DetailedAnalysis, HistoryEntry } from '../types';

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

  // FIX: LiveSession is not an exported type from @google/genai. Use `any` for the session promise.
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const analysisRef = useRef(analysis);
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
    
    setTimeout(() => {
        setAnalysis(initialAnalysisState);
        setTranscript([]);
        if (!showAlert) setShowAlert(false);
    }, 500);
  }, [showAlert]);

  const startDetection = useCallback(async () => {
    setIsStarting(true);
    setError(null);
    setTranscript([]);
    setAnalysis(initialAnalysisState);
    setShowAlert(false);

    try {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
        console.error('Failed to get microphone access:', err);
        setError('Could not access the microphone. Please grant permission and try again.');
        setIsStarting(false);
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemInstruction = `You are an AI assistant specialized in detecting voice scams and AI-generated speech (deepfakes) in real-time. Your goal is to protect the user by analyzing the audio based on 4 distinct methods and reporting your findings every 10-15 seconds via the 'report_analysis' function.

1.  **Spectral Analysis (30% weight)**: Analyze the frequency spectrum for unusual harmonics, abrupt changes, or artificial patterns.
2.  **Voice Biometric Analysis (35% weight)**: Detect irregular breathing, robotic or flat emotional tone, unnatural pacing, and pronunciation glitches.
3.  **Contextual Analysis (20% weight)**: Scan the live transcript for scam keywords. High-risk: "verify account", "suspended", "social security", "IRS", "prize won". Medium-risk: "urgent", "act now", "confirm payment", "account locked".
4.  **Audio Intelligence (15% weight)**: Identify artificial speech patterns like repetitive qualities, inconsistent or overly smooth pacing.

Continuously evaluate and call the function with updated scores and reasons for all four methods.`;
        
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
    startDetection,
    stopDetection,
  };
};

export default useScamShield;