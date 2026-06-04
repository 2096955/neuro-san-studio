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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

interface GuardrailData {
  name: string;
  health: number;
  icon: string;
}

interface GuardrailHealthBarChartProps {
  data?: GuardrailData[];
  height?: number;
  onClick?: (data: GuardrailData) => void;
}

const defaultData: GuardrailData[] = [
  { name: 'Bias Detection', health: 91, icon: '⚖️' },
  { name: 'PII Leakage', health: 87, icon: '🔒' },
  { name: 'Hallucination', health: 66, icon: '🧠' },
  { name: 'Content Safety', health: 89, icon: '⚠️' },
  { name: 'Toxicity', health: 94, icon: '🛡️' },
  { name: 'Copyright/IP', health: 88, icon: '©️' },
  { name: 'Injection Attack', health: 96, icon: '🔐' },
  { name: 'Privacy', health: 93, icon: '🔏' },
];

const GuardrailHealthBarChart: React.FC<GuardrailHealthBarChartProps> = ({
  data = defaultData,
  height = 300,
  onClick
}) => {
  const getBarColor = (health: number): string => {
    if (health >= 90) return '#10b981'; // Green
    if (health >= 70) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const CustomizedLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const radius = 10;
    
    return (
      <g>
        <text 
          x={x + width / 2} 
          y={y - 5} 
          fill="var(--text-color)" 
          textAnchor="middle" 
          dy={-6}
          fontSize="12"
          fontWeight="500"
        >
          {`${value}%`}
        </text>
      </g>
    );
  };

  const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    const data = defaultData.find(item => item.name === payload.value);
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill="var(--text-color)" 
          fontSize="11"
          fontWeight="400"
        >
          <tspan x={0} dy="0">{data?.icon}</tspan>
          <tspan x={0} dy="14" fontSize="10">{payload.value}</tspan>
        </text>
      </g>
    );
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{
            top: 30,
            right: 30,
            left: 20,
            bottom: 60,
          }}
          onClick={onClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
          <XAxis 
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={<CustomTick />}
            height={60}
          />
          <YAxis 
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Bar 
            dataKey="health" 
            radius={[4, 4, 0, 0]}
            cursor="pointer"
            label={<CustomizedLabel />}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.health)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span style={{ color: 'var(--text-secondary)' }}>Excellent (90-100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span style={{ color: 'var(--text-secondary)' }}>Good (70-89%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span style={{ color: 'var(--text-secondary)' }}>Needs Attention (0-69%)</span>
        </div>
      </div>
    </div>
  );
};

export default GuardrailHealthBarChart;
