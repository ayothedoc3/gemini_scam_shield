import React from 'react';

interface CallGuardLogoProps {
  className?: string;
  size?: number;
}

const CallGuardLogo: React.FC<CallGuardLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield background - gradient from orange to yellow */}
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>

      {/* Shield shape */}
      <path
        d="M50 10 C30 10, 15 15, 15 25 L15 50 C15 75, 35 90, 50 95 C65 90, 85 75, 85 50 L85 25 C85 15, 70 10, 50 10 Z"
        fill="url(#shieldGradient)"
      />

      {/* Phone icon in blue */}
      <path
        d="M35 35 C35 33, 36 32, 38 32 L42 32 C44 32, 45 33, 45 35 L45 65 C45 67, 44 68, 42 68 L38 68 C36 68, 35 67, 35 65 Z"
        fill="#3B82F6"
        transform="rotate(-15 40 50)"
      />

      {/* Prohibition circle in red */}
      <circle
        cx="60"
        cy="60"
        r="18"
        fill="none"
        stroke="#EF4444"
        strokeWidth="5"
      />
      <line
        x1="48"
        y1="48"
        x2="72"
        y2="72"
        stroke="#EF4444"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CallGuardLogo;
