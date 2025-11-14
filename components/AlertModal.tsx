
import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  riskScore: number;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, riskScore }) => {
    useEffect(() => {
    if (isOpen) {
      // Play an alert sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A4
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    }
  }, [isOpen]);
    
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border-2 border-red-500 rounded-2xl shadow-2xl shadow-red-500/30 max-w-md w-full animate-pulse">
        <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-500/20 mb-6">
                 <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">CRITICAL ALERT</h2>
            <p className="text-red-400 font-semibold text-lg mb-4">
              High Probability of AI Voice Detected!
            </p>
            <p className="text-5xl font-bold text-white mb-6">
                {riskScore.toFixed(0)}%
            </p>
            <p className="text-gray-300 text-md">
                This caller is likely using a synthetic voice. <br/> 
                <span className="font-bold">Do not share personal information.</span>
            </p>
        </div>
        <div className="p-4 bg-gray-900/50 text-center rounded-b-2xl">
            <p className="text-sm text-gray-400">Protection remains active. Proceed with extreme caution.</p>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;