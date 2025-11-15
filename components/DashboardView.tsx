import React from 'react';
import { TrendingUp, TrendingDown, Shield, Bot, Users, AlertTriangle, DollarSign, Activity } from 'lucide-react';

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
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-indigo-500/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-8 h-8 text-indigo-400" />
        {change && (
          <span className={`flex items-center gap-1 text-sm font-semibold ${
            trend === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Enterprise Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time protection for human & AI agents</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-lg">
          <Activity className="w-5 h-5" />
          <span className="font-semibold">{stats.uptime}% Uptime</span>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.humanAgents}</p>
              <p className="text-sm text-gray-400">Human Agents</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Active Now</span>
              <span className="text-green-400 font-semibold">{Math.floor(stats.humanAgents * 0.68)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.aiAgents}</p>
              <p className="text-sm text-gray-400">AI Agents Protected</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Active Now</span>
              <span className="text-green-400 font-semibold">{stats.aiAgents}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-500/20 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalAgents}</p>
              <p className="text-sm text-gray-400">Total Protected</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Coverage</span>
              <span className="text-green-400 font-semibold">100%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Threats */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Threats Blocked</h2>
          <span className="text-sm text-gray-400">Last 24 hours</span>
        </div>
        <div className="space-y-3">
          {recentThreats.map((threat) => (
            <div key={threat.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${
                    threat.type === 'AI Agent'
                      ? 'bg-purple-500/20'
                      : 'bg-blue-500/20'
                  }`}>
                    {threat.type === 'AI Agent'
                      ? <Bot className="w-5 h-5 text-purple-400" />
                      : <Users className="w-5 h-5 text-blue-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">{threat.agent}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        threat.type === 'AI Agent'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {threat.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{threat.threat}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-400">{threat.risk}% Risk</p>
                    <p className="text-xs text-gray-500">{threat.time}</p>
                  </div>
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-md text-sm font-semibold">
                    BLOCKED
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Agent Protection Highlight */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-purple-500/20 p-3 rounded-lg">
            <Bot className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">AI Agent Protection Active</h3>
            <p className="text-gray-300 mb-4">
              Your AI workforce is protected 24/7 from voice-based attacks including CEO fraud,
              payment manipulation, and authorization bypass attempts. AI agents are 3x more vulnerable
              to voice scams - our system provides real-time detection specifically designed for agentic security.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-purple-400">15</p>
                <p className="text-sm text-gray-400">AI Agents Protected</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">12</p>
                <p className="text-sm text-gray-400">AI-Targeted Attacks Blocked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">$185K</p>
                <p className="text-sm text-gray-400">Fraud Prevented (AI Agents)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
