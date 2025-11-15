import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

interface TimelineDataPoint {
  timestamp: string;
  riskScore: number;
  time: number;
}

interface RiskTimelineProps {
  data: TimelineDataPoint[];
  isActive: boolean;
}

const RiskTimeline: React.FC<RiskTimelineProps> = ({ data, isActive }) => {
  const getRiskColor = (score: number) => {
    if (score >= 85) return '#ef4444'; // red-500
    if (score >= 70) return '#f97316'; // orange-500
    if (score >= 40) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      const color = getRiskColor(score);
      return (
        <div className="bg-gray-800 border border-gray-600 p-3 rounded-lg shadow-lg">
          <p className="text-gray-300 text-sm">{payload[0].payload.timestamp}</p>
          <p className="text-white font-bold" style={{ color }}>
            Risk: {score.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const getGradientId = () => {
    if (!data.length) return 'colorGreen';
    const latestScore = data[data.length - 1].riskScore;
    if (latestScore >= 85) return 'colorRed';
    if (latestScore >= 70) return 'colorOrange';
    if (latestScore >= 40) return 'colorYellow';
    return 'colorGreen';
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Risk Score Timeline</h3>
        {isActive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Live Monitoring</span>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg font-semibold">No data yet</p>
            <p className="text-sm mt-2">Risk scores will appear here as the call is analyzed</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `${value}s`}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Risk level reference lines */}
            <ReferenceLine y={40} stroke="#eab308" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={70} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />

            <Area
              type="monotone"
              dataKey="riskScore"
              stroke={getRiskColor(data[data.length - 1]?.riskScore || 0)}
              strokeWidth={3}
              fill={`url(#${getGradientId()})`}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Risk level legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-400">Low (0-40)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-400">Medium (40-70)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span className="text-gray-400">High (70-85)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-400">Critical (85-100)</span>
        </div>
      </div>
    </div>
  );
};

export default RiskTimeline;
