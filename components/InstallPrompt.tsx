
import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show prompt if not installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    setShowPrompt(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Scam Shield installed');
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
      setShowPrompt(false);
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-24 right-4 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 max-w-sm animate-fade-in-up">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-indigo-500/20 text-indigo-400 p-2 rounded-full">
            <Download className="w-5 h-5" />
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-white">Install Scam Shield</h3>
          <p className="text-sm text-gray-400 mt-1">
            Add to your home screen for quick access when you need it most.
          </p>
          <div className="mt-4 flex gap-2">
            <button onClick={handleInstall} className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Install
            </button>
            <button onClick={handleDismiss} className="px-4 py-2 text-sm font-semibold text-gray-300 rounded-md hover:bg-gray-700">
              Later
            </button>
          </div>
        </div>
         <button onClick={handleDismiss} className="-mt-2 -mr-2 p-1 rounded-full hover:bg-gray-700">
            <X className="w-4 h-4 text-gray-500" />
         </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
