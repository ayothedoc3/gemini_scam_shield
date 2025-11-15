import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const HTTPSWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [httpsUrl, setHttpsUrl] = useState('');

  useEffect(() => {
    // Check if not on HTTPS and not localhost
    const isHTTP = window.location.protocol === 'http:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isHTTP && !isLocalhost) {
      setShowWarning(true);
      // Suggest HTTPS URL
      setHttpsUrl(window.location.href.replace('http:', 'https:'));
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className="bg-yellow-600 text-white p-3">
      <div className="container mx-auto flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-sm">Microphone Access Requires HTTPS</p>
          <p className="text-xs mt-1 opacity-90">
            For security, browsers require HTTPS for microphone access.
            {httpsUrl && (
              <a
                href={httpsUrl}
                className="ml-2 underline font-semibold"
              >
                Click here to use HTTPS
              </a>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="p-1 hover:bg-white/20 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HTTPSWarning;
