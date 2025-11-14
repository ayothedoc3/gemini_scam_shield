
import React from 'react';

interface RiskMeterProps {
  score: number;
  isActive: boolean;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ score, isActive }) => {
  const getRiskInfo = (s: number) => {
    if (!isActive) return { level: 'STANDBY', color: 'text-gray-400', ringColor: 'stroke-gray-600', bgColor: 'bg-gray-500' };
    if (s >= 85) return { level: 'CRITICAL', color: 'text-red-400', ringColor: 'stroke-red-500', bgColor: 'bg-red-500' };
    if (s >= 60) return { level: 'HIGH', color: 'text-orange-400', ringColor: 'stroke-orange-500', bgColor: 'bg-orange-500' };
    if (s >= 30) return { level: 'MEDIUM', color: 'text-yellow-400', ringColor: 'stroke-yellow-500', bgColor: 'bg-yellow-500' };
    return { level: 'LOW', color: 'text-green-400', ringColor: 'stroke-green-500', bgColor: 'bg-green-500' };
  };

  const riskInfo = getRiskInfo(score);
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (isActive ? score / 100 : 0) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-lg">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="80"
            strokeWidth="12"
            className="stroke-gray-700"
            fill="transparent"
          />
          <circle
            cx="100"
            cy="100"
            r="80"
            strokeWidth="12"
            strokeLinecap="round"
            className={`transition-all duration-500 ease-in-out ${riskInfo.ringColor}`}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isActive ? (
                <>
                    <span className={`text-6xl font-bold ${riskInfo.color} transition-colors duration-300`}>
                    {score.toFixed(0)}
                    </span>
                    <span className="text-sm font-medium text-gray-400">Risk Score</span>
                </>
            ) : (
                 <span className="text-2xl font-bold text-gray-500">
                    INACTIVE
                 </span>
            )}
        </div>
      </div>
      <div className="text-center">
        <p className={`text-xl font-bold transition-colors duration-300 ${riskInfo.color}`}>{riskInfo.level}</p>
        <p className="text-sm text-gray-500">Threat Level</p>
      </div>
    </div>
  );
};

export default RiskMeter;
