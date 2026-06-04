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

interface GuardrailCategory {
  id: string;
  name: string;
  health: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

interface GuardrailHealthChartProps {
  selectedNetwork?: string;
  overallHealth?: number;
  categories?: GuardrailCategory[];
  onClick?: () => void;
}

const defaultCategories: GuardrailCategory[] = [
  { id: 'toxicity', name: 'Toxicity Detection', health: 94, trend: 'stable', icon: '🛡️' },
  { id: 'pii', name: 'PII Protection', health: 87, trend: 'up', icon: '🔒' },
  { id: 'bias', name: 'Bias Detection', health: 91, trend: 'up', icon: '⚖️' },
  { id: 'copyright', name: 'Copyright/IP Protection', health: 88, trend: 'stable', icon: '©️' },
  { id: 'injection', name: 'Injection Attack Prevention', health: 96, trend: 'stable', icon: '🔐' },
  { id: 'keywords', name: 'Keyword Detection', health: 92, trend: 'down', icon: '🔍' },
  { id: 'content', name: 'Content Moderation', health: 89, trend: 'up', icon: '✅' },
  { id: 'privacy', name: 'Privacy Compliance', health: 93, trend: 'stable', icon: '🔏' },
];

const GuardrailHealthChart: React.FC<GuardrailHealthChartProps> = ({
  selectedNetwork,
  overallHealth,
  categories = defaultCategories,
  onClick
}) => {
  // Calculate overall health if not provided
  const calculatedOverallHealth = overallHealth || 
    Math.round(categories.reduce((sum, cat) => sum + cat.health, 0) / categories.length);

  const getHealthColor = (health: number): string => {
    if (health >= 90) return '#10b981'; // Green
    if (health >= 70) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getHealthStatus = (health: number): string => {
    if (health >= 90) return 'Excellent';
    if (health >= 70) return 'Good';
    return 'Needs Attention';
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
    }
  };

  return (
    <div 
      className="w-full cursor-pointer"
      onClick={onClick}
    >
      {/* Overall Health Score */}
      <div className="mb-6 text-center">
        <div className="relative inline-block">
          <svg width="120" height="120" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke={getHealthColor(calculatedOverallHealth)}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - calculatedOverallHealth / 100)}`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-800">
              {calculatedOverallHealth}%
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">
              Overall Health
            </div>
          </div>
        </div>
        <div className="mt-2">
          <span 
            className="text-sm font-medium"
            style={{ color: getHealthColor(calculatedOverallHealth) }}
          >
            {getHealthStatus(calculatedOverallHealth)}
          </span>
        </div>
      </div>

      {/* Individual Guardrail Categories */}
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sm">{category.icon}</span>
              <span className="text-sm text-gray-700 truncate">{category.name}</span>
              <span className="text-xs">{getTrendIcon(category.trend)}</span>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${category.health}%`,
                    backgroundColor: getHealthColor(category.health)
                  }}
                ></div>
              </div>
              <span 
                className="text-xs font-medium w-8 text-right"
                style={{ color: getHealthColor(category.health) }}
              >
                {category.health}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600">90-100%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-600">70-89%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600">0-69%</span>
        </div>
      </div>
    </div>
  );
};

export default GuardrailHealthChart;
