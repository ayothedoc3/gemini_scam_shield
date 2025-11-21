
import React, { useState } from 'react';
import { Shield, Upload, History, LayoutDashboard, Code, Sun, Moon, PhoneCall } from 'lucide-react';
import ProtectView from './components/ProtectView';
import UploadView from './components/UploadView';
import HistoryView from './components/HistoryView';
import DashboardView from './components/DashboardView';
import APIIntegrationView from './components/APIIntegrationView';
import TestCallView from './components/TestCallView';
import InstallPrompt from './components/InstallPrompt';
import MobileInstallBanner from './components/MobileInstallBanner';
import HTTPSWarning from './components/HTTPSWarning';
import CallGuardLogo from './components/CallGuardLogo';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

type View = 'dashboard' | 'protect' | 'upload' | 'history' | 'api' | 'testcall';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const { theme, toggleTheme } = useTheme();

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'protect':
        return <ProtectView />;
      case 'testcall':
        return <TestCallView />;
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
      className={`group relative flex-1 flex flex-col items-center justify-center gap-1 p-2 sm:p-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 ${
        activeView === view
          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
          : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:scale-105'
      }`}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12" />
      <span className="text-xs font-semibold">{label}</span>
      {activeView === view && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white animate-pulse" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-500">
      {/* Animated background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/10 dark:bg-pink-500/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <MobileInstallBanner />
      <HTTPSWarning />

      <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-gray-950/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-50 animate-pulse" />
              <CallGuardLogo size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                CALLGUARD
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block font-medium">Enterprise AI Agent Protection</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg group"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:rotate-12" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500 transition-transform group-hover:rotate-180" />
              )}
            </button>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 text-green-700 dark:text-green-300 text-xs font-semibold shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-lg shadow-green-500/50"></span>
              </span>
              <span className="hidden sm:inline">SYSTEMS OPERATIONAL</span>
              <span className="sm:hidden">ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="animate-fadeIn">
          {renderView()}
        </div>
      </main>

      <footer className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky bottom-0 z-50 border-t border-gray-200 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-gray-950/50">
        <nav className="container mx-auto p-2 sm:p-3">
          <div className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 rounded-2xl flex items-center justify-around gap-1.5 shadow-lg overflow-x-auto">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="protect" icon={Shield} label="Protect" />
            <NavItem view="testcall" icon={PhoneCall} label="Test Call" />
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

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
