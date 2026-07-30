import React from 'react';

interface DonutChartProps {
  percentage: number;
  color: string;
  label?: string;
  size?: number;
  strokeWidth?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  percentage,
  color,
  size = 80,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Center Percentage Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-slate-800">{percentage}%</span>
      </div>
    </div>
  );
};
