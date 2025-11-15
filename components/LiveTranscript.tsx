import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import type { TranscriptEntry } from '../types';

interface LiveTranscriptProps {
  transcript: TranscriptEntry[];
  keywordsToHighlight?: string[];
}

const HighlightedText: React.FC<{ text: string; keywords: string[] }> = ({ text, keywords }) => {
  if (!keywords || keywords.length === 0) {
    return <>{text}</>;
  }
  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-500/30 text-yellow-200 font-bold px-1 rounded">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

const LiveTranscript: React.FC<LiveTranscriptProps> = ({ transcript, keywordsToHighlight = [] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div ref={scrollRef} className="flex-grow bg-gray-900/50 p-4 rounded-lg overflow-y-auto h-full min-h-64">
      {transcript.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Waiting for audio to begin transcription...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transcript.map((entry, index) => (
            <div key={index}>
              {entry.speaker === 'system' ? (
                <div className="flex items-center justify-center gap-2 my-3">
                    <div className="w-full h-px bg-gray-700"></div>
                    <div className="flex-shrink-0 flex items-center gap-2 text-sm text-indigo-300 italic text-center">
                        <Bot size={16} />
                        <span>{entry.text}</span>
                    </div>
                    <div className="w-full h-px bg-gray-700"></div>
                </div>
              ) : (
                <div className="flex flex-col">
                    <span className={`text-xs font-semibold mb-1 capitalize flex items-center gap-2 ${
                      entry.speaker.toLowerCase().includes('caller') || entry.speaker.toLowerCase().includes('speaker 1')
                        ? 'text-blue-400'
                        : entry.speaker.toLowerCase().includes('recipient') || entry.speaker.toLowerCase().includes('speaker 2')
                        ? 'text-green-400'
                        : 'text-gray-500'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        entry.speaker.toLowerCase().includes('caller') || entry.speaker.toLowerCase().includes('speaker 1')
                          ? 'bg-blue-400'
                          : entry.speaker.toLowerCase().includes('recipient') || entry.speaker.toLowerCase().includes('speaker 2')
                          ? 'bg-green-400'
                          : 'bg-gray-500'
                      }`}></span>
                      {entry.timestamp} - {entry.speaker}
                    </span>
                    <div className={`text-gray-200 leading-relaxed p-3 rounded-lg rounded-tl-none ${
                      entry.speaker.toLowerCase().includes('caller') || entry.speaker.toLowerCase().includes('speaker 1')
                        ? 'bg-blue-900/20 border border-blue-800/30'
                        : entry.speaker.toLowerCase().includes('recipient') || entry.speaker.toLowerCase().includes('speaker 2')
                        ? 'bg-green-900/20 border border-green-800/30'
                        : 'bg-gray-800'
                    }`}>
                        <HighlightedText text={entry.text} keywords={keywordsToHighlight} />
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveTranscript;
