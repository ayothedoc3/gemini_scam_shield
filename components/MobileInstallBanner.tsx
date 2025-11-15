import React, { useEffect, useState } from 'react';
import { Smartphone, X, Share, Plus } from 'lucide-react';

const MobileInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasSeenBanner = localStorage.getItem('installBannerDismissed');

    if (isStandalone || hasSeenBanner) {
      return;
    }

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);

    setIsIOS(ios);
    setIsAndroid(android);

    // Show banner on mobile devices
    if (ios || android) {
      setShowBanner(true);
    }

    // Listen for install prompt (Android Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    setDeferredPrompt(null);
    setShowBanner(false);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-white/20 p-2 rounded-lg">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">Install Scam Shield</h3>
            <p className="text-xs opacity-90 mt-0.5">
              {isIOS && "Tap Share "}
              {isAndroid && deferredPrompt && "Install for instant access"}
              {isAndroid && !deferredPrompt && "Add to Home Screen"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isIOS && (
            <div className="bg-white/20 px-3 py-1.5 rounded-md flex items-center gap-1 text-xs">
              <Share className="w-4 h-4" />
              <span>then</span>
              <Plus className="w-4 h-4" />
            </div>
          )}
          {isAndroid && deferredPrompt && (
            <button
              onClick={handleInstallAndroid}
              className="bg-white text-indigo-600 px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-100"
            >
              Install
            </button>
          )}
          {isAndroid && !deferredPrompt && (
            <div className="text-xs opacity-90">
              Use browser menu → "Add to Home Screen"
            </div>
          )}
          <button
            onClick={handleDismiss}
            className="ml-2 p-1 rounded-full hover:bg-white/20"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* iOS Instructions overlay */}
      {isIOS && (
        <div className="px-4 pb-3 text-xs bg-black/10">
          <div className="flex items-center gap-2">
            <span className="font-semibold">How to install:</span>
            <span className="opacity-90">
              Tap <Share className="w-3 h-3 inline mx-1" /> in your browser → "Add to Home Screen"
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileInstallBanner;
