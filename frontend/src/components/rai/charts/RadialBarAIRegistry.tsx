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
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

interface RegistryData {
  name: string;
  domain?: string;
  count: number;
  percentage: number;
}

interface RadialBarAIRegistryProps {
  data: RegistryData[];
}

const COLORS = [
  '#8b5cf6', // Vibrant Purple
  '#3b82f6', // Bright Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber/Gold
  '#ef4444', // Red
  '#ec4899', // Hot Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#a855f7', // Light Purple
  '#22c55e', // Lime Green
  '#f43f5e', // Rose
];

const RadialBarAIRegistry: React.FC<RadialBarAIRegistryProps> = ({ data }) => {
  // Transform data for RadialBarChart
  const chartData = data.map((registry, index) => ({
    name: registry.name,
    value: registry.count,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="10%"
          outerRadius="90%"
          barSize={12}
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background
            dataKey="value"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="font-semibold text-gray-900 text-sm mb-1">
                      {data.name.replace(' AI Registry', '')}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {data.value} systems
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3 px-4">
        {chartData.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: entry.fill }}
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-700 truncate block">
                {entry.name.replace(' AI Registry', '')}
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-900 flex-shrink-0">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadialBarAIRegistry;
