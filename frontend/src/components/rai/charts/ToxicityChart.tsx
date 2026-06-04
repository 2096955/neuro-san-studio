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
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface ToxicityDataPoint {
  date: string;
  detections: number;
  severity?: 'low' | 'medium' | 'high';
}

interface ToxicityChartProps {
  data?: ToxicityDataPoint[];
  height?: number;
}

// Updated data for October 2025 - last 7 days (Oct 7-13)
const defaultData: ToxicityDataPoint[] = [
  // Oct 7 (12 data points - 2 hour intervals)
  { date: 'Oct 7', detections: 2 }, { date: '', detections: 3 }, { date: '', detections: 1 }, { date: '', detections: 2 },
  { date: '', detections: 4 }, { date: '', detections: 2 }, { date: '', detections: 1 }, { date: '', detections: 3 },
  { date: '', detections: 2 }, { date: '', detections: 1 }, { date: '', detections: 2 }, { date: '', detections: 1 },
  
  // Oct 8 (12 data points)
  { date: 'Oct 8', detections: 3 }, { date: '', detections: 2 }, { date: '', detections: 4 }, { date: '', detections: 3 },
  { date: '', detections: 1 }, { date: '', detections: 2 }, { date: '', detections: 3 }, { date: '', detections: 1 },
  { date: '', detections: 2 }, { date: '', detections: 4 }, { date: '', detections: 2 }, { date: '', detections: 1 },
  
  // Oct 9 (12 data points)
  { date: 'Oct 9', detections: 2 }, { date: '', detections: 1 }, { date: '', detections: 3 }, { date: '', detections: 2 },
  { date: '', detections: 1 }, { date: '', detections: 2 }, { date: '', detections: 3 }, { date: '', detections: 1 },
  { date: '', detections: 2 }, { date: '', detections: 1 }, { date: '', detections: 3 }, { date: '', detections: 2 },
  
  // Oct 10 (12 data points)
  { date: 'Oct 10', detections: 1 }, { date: '', detections: 2 }, { date: '', detections: 1 }, { date: '', detections: 3 },
  { date: '', detections: 2 }, { date: '', detections: 1 }, { date: '', detections: 2 }, { date: '', detections: 1 },
  { date: '', detections: 3 }, { date: '', detections: 2 }, { date: '', detections: 1 }, { date: '', detections: 2 },
  
  // Oct 11 (12 data points)
  { date: 'Oct 11', detections: 2 }, { date: '', detections: 3 }, { date: '', detections: 1 }, { date: '', detections: 2 },
  { date: '', detections: 1 }, { date: '', detections: 3 }, { date: '', detections: 2 }, { date: '', detections: 1 },
  { date: '', detections: 2 }, { date: '', detections: 3 }, { date: '', detections: 1 }, { date: '', detections: 2 },
  
  // Oct 12 (12 data points)
  { date: 'Oct 12', detections: 3 }, { date: '', detections: 2 }, { date: '', detections: 1 }, { date: '', detections: 2 },
  { date: '', detections: 3 }, { date: '', detections: 1 }, { date: '', detections: 2 }, { date: '', detections: 3 },
  { date: '', detections: 1 }, { date: '', detections: 2 }, { date: '', detections: 1 }, { date: '', detections: 2 },
  
  // Oct 13 (12 data points - today)
  { date: 'Oct 13', detections: 2 }, { date: '', detections: 1 }, { date: '', detections: 3 }, { date: '', detections: 2 },
  { date: '', detections: 1 }, { date: '', detections: 2 }, { date: '', detections: 1 }, { date: '', detections: 3 },
  { date: '', detections: 2 }, { date: '', detections: 1 }, { date: '', detections: 2 }, { date: '', detections: 1 },
];

const ToxicityChart: React.FC<ToxicityChartProps> = ({
  data = defaultData,
  height = 200
}) => {
  // Calculate total detections
  const totalDetections = data.reduce((sum, point) => sum + point.detections, 0);
  const avgDetections = (totalDetections / data.length).toFixed(1);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">
            {payload[0].value} detections
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
            Input Toxicity Trigger Detections
          </h3>
        </div>
        <div className="text-xs text-gray-500">
          Avg: <span className="font-semibold text-gray-700">{avgDetections}</span> per interval
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="toxicityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            interval={0}
            tickFormatter={(value) => value || ''}
          />
          <YAxis 
            domain={[0, 5]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            ticks={[0, 1, 2, 3, 4, 5]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="detections"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#toxicityGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Last 7 days (Oct 7-13, 2025)
      </div>
    </div>
  );
};

export default ToxicityChart;
