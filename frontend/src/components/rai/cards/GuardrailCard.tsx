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

interface GuardrailCardProps {
  id: string;
  name: string;
  health: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  icon: string;
  onClick?: (id: string) => void;
}

const GuardrailCard: React.FC<GuardrailCardProps> = ({
  id,
  name,
  health,
  trend,
  icon,
  onClick
}) => {
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
      className="p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
      style={{ 
        backgroundColor: 'var(--config-input-bg)',
        color: 'var(--text-color)'
      }}
      onClick={() => onClick?.(id)}
    >
      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="text-xs">{getTrendIcon(trend)}</span>
        </div>
        <div className="text-right">
          <div 
            className="text-2xl font-bold"
            style={{ color: getHealthColor(health) }}
          >
            {health}%
          </div>
        </div>
      </div>

      {/* Guardrail name */}
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-800 leading-tight">
          {name}
        </h3>
      </div>

      {/* Health bar */}
      <div className="mb-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${health}%`,
              backgroundColor: getHealthColor(health)
            }}
          ></div>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <span 
          className="text-xs font-medium"
          style={{ color: getHealthColor(health) }}
        >
          {getHealthStatus(health)}
        </span>
      </div>
    </div>
  );
};

export default GuardrailCard;
