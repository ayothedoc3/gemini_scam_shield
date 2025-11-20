import React from 'react';
import { TrendingUp, TrendingDown, Shield, Bot, Users, AlertTriangle, DollarSign, Activity, Zap } from 'lucide-react';

const DashboardView: React.FC = () => {
  // Mock data for enterprise dashboard
  const stats = {
    totalAgents: 47,
    humanAgents: 32,
    aiAgents: 15,
    callsToday: 1847,
    threatsBlocked: 23,
    avgRiskScore: 18.4,
    costSaved: 287500,
    uptime: 99.97
  };

  const recentThreats = [
    { id: 1, type: 'AI Agent', agent: 'Support Bot Alpha', threat: 'CEO Fraud Attempt', risk: 94, time: '2 min ago', blocked: true },
    { id: 2, type: 'Human', agent: 'Sarah Chen', threat: 'Deepfake Voice Clone', risk: 89, time: '8 min ago', blocked: true },
    { id: 3, type: 'AI Agent', agent: 'Payment Processor Bot', threat: 'Wire Transfer Scam', risk: 97, time: '15 min ago', blocked: true },
    { id: 4, type: 'Human', agent: 'Mike Johnson', threat: 'IRS Impersonation', risk: 76, time: '23 min ago', blocked: true },
    { id: 5, type: 'AI Agent', agent: 'Scheduling Bot Gamma', threat: 'Calendar Manipulation', risk: 82, time: '1 hour ago', blocked: true }
  ];

  const StatCard = ({ icon: Icon, label, value, change, trend }: any) => (
    <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 animate-slideUp">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          {change && (
            <span className={`flex items-center gap-1 text-sm font-bold ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {change}%
            </span>
          )}
        </div>
        <p className="text-4xl font-black bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">{value}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="animate-slideUp">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Enterprise Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">Real-time protection for human & AI agents</p>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10 text-green-700 dark:text-green-300 px-5 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 animate-slideUp">
          <Activity className="w-5 h-5 animate-pulse" />
          <span>{stats.uptime}% Uptime</span>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Shield}
          label="Threats Blocked Today"
          value={stats.threatsBlocked}
          change={12}
          trend="down"
        />
        <StatCard
          icon={Activity}
          label="Calls Analyzed Today"
          value={stats.callsToday.toLocaleString()}
          change={8}
          trend="up"
        />
        <StatCard
          icon={DollarSign}
          label="Fraud Prevention Savings"
          value={`$${(stats.costSaved / 1000).toFixed(0)}K`}
          change={23}
          trend="up"
        />
        <StatCard
          icon={TrendingDown}
          label="Average Risk Score"
          value={stats.avgRiskScore.toFixed(1)}
          change={15}
          trend="down"
        />
      </div>

      {/* Agent Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.humanAgents}</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Human Agents</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600 dark:text-gray-400">Active Now</span>
              <span className="text-green-600 dark:text-green-400 font-bold">{Math.floor(stats.humanAgents * 0.68)}</span>
            </div>
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full shadow-lg shadow-blue-500/50 transition-all duration-1000" style={{ width: '68%' }}></div>
            </div>
          </div>
        </div>

        <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Bot className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.aiAgents}</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">AI Agents Protected</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600 dark:text-gray-400">Active Now</span>
              <span className="text-green-600 dark:text-green-400 font-bold">{stats.aiAgents}</span>
            </div>
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full shadow-lg shadow-purple-500/50 transition-all duration-1000" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalAgents}</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Protected</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600 dark:text-gray-400">Coverage</span>
              <span className="text-green-600 dark:text-green-400 font-bold">100%</span>
            </div>
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full shadow-lg shadow-indigo-500/50 transition-all duration-1000" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Threats */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Recent Threats Blocked</h2>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/50 px-4 py-2 rounded-lg">Last 24 hours</span>
        </div>
        <div className="space-y-3">
          {recentThreats.map((threat, index) => (
            <div
              key={threat.id}
              className="group bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-red-500/50 dark:hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 animate-slideUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-xl ${
                    threat.type === 'AI Agent'
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                      : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
                  } group-hover:scale-110 transition-transform duration-300`}>
                    {threat.type === 'AI Agent'
                      ? <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      : <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 dark:text-white">{threat.agent}</p>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        threat.type === 'AI Agent'
                          ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                          : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                      }`}>
                        {threat.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{threat.threat}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{threat.risk}% Risk</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">{threat.time}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-black shadow-md">
                    BLOCKED
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Agent Protection Highlight */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-pink-500/20 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-pink-900/30 border border-purple-300 dark:border-purple-500/30 rounded-2xl p-8 shadow-2xl shadow-purple-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl -z-10" />

        <div className="relative flex items-start gap-6">
          <div className="p-5 bg-gradient-to-br from-purple-500/30 to-pink-500/30 dark:from-purple-500/20 dark:to-pink-500/20 rounded-2xl backdrop-blur-sm">
            <Bot className="w-10 h-10 text-purple-700 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">AI Agent Protection Active</h3>
              <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-base font-medium leading-relaxed">
              Your AI workforce is protected 24/7 from voice-based attacks including CEO fraud,
              payment manipulation, and authorization bypass attempts. AI agents are 3x more vulnerable
              to voice scams - our system provides real-time detection specifically designed for agentic security.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-200 dark:border-purple-500/20">
                <p className="text-3xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.aiAgents}</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-400 mt-1">AI Agents Protected</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-200 dark:border-purple-500/20">
                <p className="text-3xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">12</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-400 mt-1">AI-Targeted Attacks Blocked</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-200 dark:border-purple-500/20">
                <p className="text-3xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">$185K</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-400 mt-1">Fraud Prevented (AI Agents)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
