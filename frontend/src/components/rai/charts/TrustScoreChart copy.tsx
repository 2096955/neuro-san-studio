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
import { PieChart, Pie, Cell } from 'recharts';

interface TrustScoreChartProps {
  score: number; // Score from 0-100
  size?: number;
  onClick?: () => void;
  label?: string;
}

const RADIAN = Math.PI / 180;

type Needle = {
  value: number;
  data: { name: string; value: number; color: string }[];
  cx: number;
  cy: number;
  iR: number;
  oR: number;
  color: string;
};

const needle = ({ value, data, cx, cy, iR, oR, color }: Needle) => {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const ang = 180.0 * (1 - value / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = 5;
  const x0 = cx + 5;
  const y0 = cy + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return [
    <circle key="needle-circle" cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
    <path
      key="needle-path"
      d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
      stroke="none"
      fill={color}
    />,
  ];
};

const TrustScoreChart: React.FC<TrustScoreChartProps> = ({
  score,
  size = 300,
  onClick,
  label = "Trust Score"
}) => {
  // Create data for the semicircle gauge
  const chartData = [
    { name: 'Low', value: 40, color: '#ef4444' }, // Red - 0-39
    { name: 'Medium', value: 40, color: '#f59e0b' }, // Amber - 40-79  
    { name: 'High', value: 20, color: '#10b981' }, // Green - 80-100
  ];

  const cx = size / 2;
  const cy = size / 2;
  const iR = size * 0.25;
  const oR = size * 0.4;

  return (
    <div 
      className="flex flex-col items-center cursor-pointer"
      onClick={onClick}
      style={{ width: size, height: size * 0.8 }}
    >
      <div className="relative">
        <PieChart width={size} height={size * 0.6}>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={chartData}
            cx={cx}
            cy={cy}
            innerRadius={iR}
            outerRadius={oR}
            stroke="none"
            isAnimationActive={false}
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
          {needle({ value: score, data: chartData, cx, cy, iR, oR, color: '#374151' })}
        </PieChart>

        {/* Score display */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ top: size * 0.15 }}
        >
          <div className="text-2xl font-bold text-gray-800">
            {Math.floor(score)}
          </div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">
            {label}
          </div>
        </div>
      </div>

      {/* Score ranges indicator */}
      <div className="flex items-center gap-4 mt-2 text-xs">
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
  );
};

export default TrustScoreChart;
