
import React, { useState } from 'react';
import { Shield, Upload, History, LayoutDashboard, Code } from 'lucide-react';
import ProtectView from './components/ProtectView';
import UploadView from './components/UploadView';
import HistoryView from './components/HistoryView';
import DashboardView from './components/DashboardView';
import APIIntegrationView from './components/APIIntegrationView';
import InstallPrompt from './components/InstallPrompt';
import MobileInstallBanner from './components/MobileInstallBanner';
import HTTPSWarning from './components/HTTPSWarning';
import CallGuardLogo from './components/CallGuardLogo';

type View = 'dashboard' | 'protect' | 'upload' | 'history' | 'api';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'protect':
        return <ProtectView />;
      case 'upload':
        return <UploadView />;
      case 'history':
        return <HistoryView />;
      case 'api':
        return <APIIntegrationView />;
      default:
        return <DashboardView />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: React.ElementType, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 sm:p-3 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
        activeView === view ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="text-xs">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <MobileInstallBanner />
      <HTTPSWarning />
       <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CallGuardLogo size={40} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                CALLGUARD
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">Enterprise AI Agent Protection</p>
            </div>
          </div>
            <div className="flex items-center gap-2 p-2 rounded-full bg-green-500/20 text-green-300 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="hidden sm:inline">SYSTEMS OPERATIONAL</span>
            </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>

      <footer className="bg-gray-800/50 backdrop-blur-sm sticky bottom-0 z-10 border-t border-gray-700">
        <nav className="container mx-auto p-2 sm:p-3">
            <div className="bg-gray-800 p-1 rounded-xl flex items-center justify-around gap-1">
                <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem view="protect" icon={Shield} label="Protect" />
                <NavItem view="api" icon={Code} label="API" />
                <NavItem view="upload" icon={Upload} label="Upload" />
                <NavItem view="history" icon={History} label="History" />
            </div>
        </nav>
      </footer>
      <InstallPrompt />
    </div>
  );
};

export default App;
