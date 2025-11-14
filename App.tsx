
import React, { useState } from 'react';
import { Shield, Upload, History, Bot } from 'lucide-react';
import ProtectView from './components/ProtectView';
import UploadView from './components/UploadView';
import HistoryView from './components/HistoryView';
import InstallPrompt from './components/InstallPrompt';

type View = 'protect' | 'upload' | 'history';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('protect');

  const renderView = () => {
    switch (activeView) {
      case 'protect':
        return <ProtectView />;
      case 'upload':
        return <UploadView />;
      case 'history':
        return <HistoryView />;
      default:
        return <ProtectView />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: React.ElementType, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 p-3 sm:p-4 text-sm font-medium rounded-lg transition-colors ${
        activeView === view ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
       <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              SCAM SHIELD
            </h1>
          </div>
            <div className="flex items-center gap-2 p-2 rounded-full bg-green-500/20 text-green-300 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                SYSTEMS OPERATIONAL
            </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>

      <footer className="bg-gray-800/50 backdrop-blur-sm sticky bottom-0 z-10 border-t border-gray-700">
        <nav className="container mx-auto p-2 sm:p-3">
            <div className="bg-gray-800 p-1 rounded-xl flex items-center justify-around gap-1 sm:gap-2">
                <NavItem view="protect" icon={Shield} label="Live Protection" />
                <NavItem view="upload" icon={Upload} label="Upload Audio" />
                <NavItem view="history" icon={History} label="Analysis History" />
            </div>
        </nav>
      </footer>
      <InstallPrompt />
    </div>
  );
};

export default App;
