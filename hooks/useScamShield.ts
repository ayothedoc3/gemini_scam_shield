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
            setError('Your browser does not support microphone access. Please use Chrome, Safari, or Edge.');
            setIsStarting(false);
            return;
        }

        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
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
        
        const systemInstruction = `You are an AI assistant specialized in detecting voice scams and AI-generated speech (deepfakes) in real-time. Your goal is to protect the user by analyzing the audio based on 4 distinct methods and reporting your findings FREQUENTLY (every 5-10 seconds of audio) via the 'report_analysis' function.

CRITICAL: Call the 'report_analysis' function IMMEDIATELY when you detect audio, and then continue calling it regularly every 5-10 seconds with updated analysis. Do NOT wait for long periods without reporting.

IMPORTANT: Scores should be BIDIRECTIONAL - they can go UP or DOWN based on the conversation. As trust is established or suspicion decreases, LOWER the scores accordingly. Give accurate, dynamic assessments.

SPEAKER IDENTIFICATION: When transcribing, try to identify different speakers in the conversation. If you detect a change in voice characteristics (different pitch, tone, speaking style), mark it as a different speaker. Label speakers as "Caller" and "Recipient" or "Speaker 1" and "Speaker 2" to help the user understand who is speaking.

1.  **Spectral Analysis (30% weight)**: Analyze the frequency spectrum for unusual harmonics, abrupt changes, or artificial patterns.
    - INCREASE score: Unnatural harmonics, artificial frequency patterns, synthetic audio signatures
    - DECREASE score: Natural frequency variations, consistent human vocal characteristics, authentic breath resonance

2.  **Voice Biometric Analysis (35% weight)**: Detect irregular breathing, robotic or flat emotional tone, unnatural pacing, and pronunciation glitches.
    - INCREASE score: Missing breaths, flat affect, robotic pacing, unnatural consistency, pronunciation errors
    - DECREASE score: Natural breathing patterns, genuine emotional variation, authentic human speech rhythms, natural imperfections

3.  **Contextual Analysis (20% weight)**: Scan the live transcript for scam keywords AND trust indicators.
    - INCREASE score: High-risk keywords ("verify account", "suspended", "social security", "IRS", "prize won", "wire money", "gift cards"). Medium-risk ("urgent", "act now", "confirm payment", "account locked").
    - DECREASE score: Normal conversation topics, legitimate business discussion, personal familiarity cues, verifiable information sharing, natural conversational flow

4.  **Audio Intelligence (15% weight)**: Identify artificial speech patterns like repetitive qualities, inconsistent or overly smooth pacing.
    - INCREASE score: Unnaturally consistent pacing, repetitive patterns, overly smooth delivery, scripted monotone
    - DECREASE score: Natural conversational dynamics, authentic pauses and filler words, genuine thinking moments, spontaneous responses

SCORING GUIDANCE:
- Start with neutral baseline scores (20-30) when conversation begins
- Adjust UP when detecting scam/deepfake indicators
- Adjust DOWN when detecting legitimate conversation indicators
- A legitimate call should trend toward 0-30 range
- A suspicious call should trend toward 70-100 range
- Provide honest, dynamic assessments that reflect the actual conversation quality

Each call should include all four method scores with current reasoning based on the ENTIRE conversation so far.`;
        
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