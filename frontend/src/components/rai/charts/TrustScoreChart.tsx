// Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
// All Rights Reserved.
// Issued under the Academic Public License.
//
// You can be released from the terms, and requirements of the Academic Public
// License by purchasing a commercial license.
// Purchase of a commercial license is mandatory for any use of the
// nsflow SDK Software in commercial settings.
//
// END COPYRIGHT

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RADIAN = Math.PI / 180;

// Custom needle component that works with ResponsiveContainer
const ResponsiveNeedle = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, value, data } = props;
  
  if (!cx || !cy) return null;
  
  const total = data.reduce((sum: number, entry: any) => sum + entry.value, 0);
  const ang = 180.0 * (1 - value / total);
  const length = (innerRadius + 2 * outerRadius) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = Math.max(2, Math.min(cx, cy) * 0.03); // Scale radius with container size
  
  const x0 = cx;
  const y0 = cy;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return (
    <g>
      <circle cx={x0} cy={y0} r={r} fill="#374151" stroke="none" />
      <path
        d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
        stroke="none"
        fill="#374151"
      />
    </g>
  );
};

interface TrustScoreChartProps {
  score: number; // Score from 0-100
  size?: number;
  onClick?: () => void;
  label?: string;
}


const TrustScoreChart: React.FC<TrustScoreChartProps> = ({
  score,
  onClick,
  label = "Trust Score"
}) => {
  // Create data for the semicircle gauge
  const chartData = [
    { name: 'Low', value: 40, color: '#ef4444' }, // Red - 0-39
    { name: 'Medium', value: 40, color: '#f59e0b' }, // Amber - 40-79  
    { name: 'High', value: 20, color: '#10b981' }, // Green - 80-100
  ];

  return (
    <div className="w-full max-w-sm mx-auto">
      <div 
        className="flex flex-col items-center cursor-pointer"
        onClick={onClick}
      >
        <div className="relative w-full">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                dataKey="value"
                startAngle={180}
                endAngle={0}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="70%"
                stroke="none"
                isAnimationActive={false}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Responsive Needle Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <ResponsiveNeedle 
                value={score} 
                data={chartData} 
                cx={50}
                cy={50}
                innerRadius={20}
                outerRadius={35}
              />
            </svg>
          </div>

          {/* Score display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center top-12">
            <div className="text-2xl font-bold text-gray-800">
              {Math.floor(score)}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">
              {label}
            </div>
          </div>
        </div>

        {/* Score ranges indicator */}
        <div className="flex items-center gap-2 sm:gap-4 mt-4 text-xs flex-wrap justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">0-39</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">40-79</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">80-100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustScoreChart;
