import React, { useState, useCallback } from 'react';
import { Upload, FileAudio, X, Loader, Bot } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import type { DetailedAnalysis, HistoryEntry } from '../types';
import AnalysisBreakdown from './AnalysisBreakdown';

const UploadView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DetailedAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setAnalysisResult(null);
      setError(null);
    }
  };
  
  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        setError('API key is not configured. Please set GEMINI_API_KEY in environment variables.');
        setIsAnalyzing(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const audioData = await file.arrayBuffer();
      const base64Audio = arrayBufferToBase64(audioData);
      
      const audioPart = {
        inlineData: {
          data: base64Audio,
          mimeType: file.type,
        },
      };
      
      const systemInstruction = `You are an AI assistant specialized in detecting voice scams and AI-generated speech (deepfakes). Analyze this audio file based on 4 methods:
1.  **Spectral Analysis**: Look for unusual harmonics, abrupt frequency changes, and artificial patterns.
2.  **Voice Biometric Analysis**: Check for irregular breathing, flat emotional tone, robotic pacing, and pronunciation glitches.
3.  **Contextual Analysis**: Scan the transcript for high-risk scam keywords (e.g., "verify account", "social security", "IRS", "prize won") and medium-risk keywords (e.g., "urgent", "act now", "confirm payment").
4.  **Audio Intelligence**: Detect unnaturally repetitive or consistent speech patterns over time.
Return a weighted risk score and a brief reason for each method. The final output must be a JSON object adhering to the provided schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [ { parts: [ { text: systemInstruction }, audioPart ] } ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    spectral_score: { type: Type.NUMBER, description: 'Score (0-100) for spectral analysis.' },
                    spectral_reason: { type: Type.STRING, description: 'Reason for spectral score.' },
                    biometric_score: { type: Type.NUMBER, description: 'Score (0-100) for voice biometric analysis.' },
                    biometric_reason: { type: Type.STRING, description: 'Reason for biometric score.' },
                    contextual_score: { type: Type.NUMBER, description: 'Score (0-100) for contextual analysis.' },
                    contextual_reason: { type: Type.STRING, description: 'Reason for contextual score.' },
                    contextual_keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of detected scam keywords.' },
                    intelligence_score: { type: Type.NUMBER, description: 'Score (0-100) for audio intelligence/pattern analysis.' },
                    intelligence_reason: { type: Type.STRING, description: 'Reason for intelligence score.' },
                },
                required: ["spectral_score", "spectral_reason", "biometric_score", "biometric_reason", "contextual_score", "contextual_reason", "contextual_keywords", "intelligence_score", "intelligence_reason"],
            },
        }
      });

      const resultText = response.text;
      const resultJson = JSON.parse(resultText);

      const aggregateScore = (resultJson.spectral_score * 0.30) + (resultJson.biometric_score * 0.35) + (resultJson.contextual_score * 0.20) + (resultJson.intelligence_score * 0.15);

      const newAnalysisResult: DetailedAnalysis = {
          spectral: { score: resultJson.spectral_score, reason: resultJson.spectral_reason },
          biometric: { score: resultJson.biometric_score, reason: resultJson.biometric_reason },
          contextual: { score: resultJson.contextual_score, reason: resultJson.contextual_reason, keywords: resultJson.contextual_keywords },
          intelligence: { score: resultJson.intelligence_score, reason: resultJson.intelligence_reason },
          aggregateScore: aggregateScore
      };
      setAnalysisResult(newAnalysisResult);
      
      // Save to history
      try {
        const historyJson = localStorage.getItem('scamShieldHistory');
        const history: HistoryEntry[] = historyJson ? JSON.parse(historyJson) : [];
        const newEntry: HistoryEntry = {
          ...newAnalysisResult,
          id: new Date().toISOString() + Math.random(),
          date: new Date().toISOString(),
          source: 'upload',
          sourceName: file.name,
        };
        history.unshift(newEntry);
        localStorage.setItem('scamShieldHistory', JSON.stringify(history));
      } catch (e) {
        console.error("Failed to save history:", e);
      }

    } catch (err) {
        console.error("Analysis failed:", err);
        setError("Failed to analyze the audio file. The file may be corrupted or in an unsupported format. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setAnalysisResult(null);
    setError(null);
  };

  const onDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
      setAnalysisResult(null);
      setError(null);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Upload Voicemail or Audio File</h2>
        <p className="text-gray-400 mb-8">Get a detailed, multi-method analysis of a pre-recorded audio file.</p>
        
        {!file ? (
          <label 
            htmlFor="audio-upload"
            onDragOver={onDragOver}
            onDrop={onDrop}
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">MP3, WAV, M4A, OGG, or FLAC (MAX. 10MB)</p>
            </div>
            <input id="audio-upload" type="file" className="hidden" onChange={handleFileChange} accept="audio/*" />
          </label>
        ) : (
          <div className="w-full p-6 bg-gray-800/50 rounded-xl border border-gray-700 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileAudio className="w-8 h-8 text-indigo-400" />
                <div>
                  <p className="font-medium text-white">{file.name}</p>
                  <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={removeFile} className="p-2 rounded-full hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {file && (
          <div className="mt-8">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 py-3 px-6 rounded-lg text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                'Analyze File'
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-900/50 text-red-300 rounded-lg border border-red-700">
            <p>{error}</p>
          </div>
        )}

        {analysisResult && (
           <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700 text-left">
             <div className="flex items-start gap-4">
                <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-full mt-1">
                   <Bot className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-white mb-4">Analysis Result</h3>
                    <AnalysisBreakdown analysis={analysisResult} />
                </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default UploadView;