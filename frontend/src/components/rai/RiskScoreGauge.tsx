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


interface RiskScoreGaugeProps {
  averageRiskScore: number;
  riskLevel: string;
  nistScore: number;
  owaspScore: number;
  successfulAttacks: number;
  title?: string;
}

const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  averageRiskScore,
  riskLevel,
  nistScore,
  owaspScore,
  successfulAttacks,
  title = "Average Risk Score"
}) => {
  // Get color based on risk level - matching trust score colors
  const getRiskColor = (score: number) => {
    if (score <= 30) return '#10b981'; // Green (Low Risk)
    if (score <= 60) return '#f59e0b'; // Yellow (Medium Risk)
    return '#ef4444'; // Red (High Risk)
  };

  const riskColor = getRiskColor(averageRiskScore);

  return (
    <div 
      className="p-6 rounded-lg shadow-lg"
      style={{ 
        backgroundColor: 'var(--config-input-bg)',
        border: '1px solid var(--border-color)'
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 
            className="text-lg font-semibold"
            style={{ color: 'var(--text-color)' }}
          >
            {title}
          </h2>
          <span 
            className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs font-bold"
            style={{ 
              borderColor: 'var(--text-color-secondary)',
              color: 'var(--text-color-secondary)'
            }}
          >
            ?
          </span>
        </div>
      </div>

      {/* Custom SVG Semicircle Gauge */}
      <div className="relative flex justify-center mb-8">
        <div className="relative w-64 h-40">
          <svg width="256" height="160" viewBox="0 0 256 160" className="overflow-visible">
            {/* Background semicircle */}
            <path
              d="M 20 140 A 108 108 0 0 1 236 140"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="20"
              strokeLinecap="round"
            />
            
            {/* Green segment (0-30%) */}
            <path
              d="M 20 140 A 108 108 0 0 1 85.6 46.4"
              fill="none"
              stroke="#10b981"
              strokeWidth="20"
              strokeLinecap="round"
              opacity={averageRiskScore > 0 ? 1 : 0.3}
            />
            
            {/* Yellow segment (30-60%) */}
            <path
              d="M 85.6 46.4 A 108 108 0 0 1 170.4 46.4"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="20"
              strokeLinecap="round"
              opacity={averageRiskScore > 30 ? 1 : 0.3}
            />
            
            {/* Red segment (60-100%) */}
            <path
              d="M 170.4 46.4 A 108 108 0 0 1 236 140"
              fill="none"
              stroke="#ef4444"
              strokeWidth="20"
              strokeLinecap="round"
              opacity={averageRiskScore > 60 ? 1 : 0.3}
            />
            
            {/* Needle */}
            <g transform={`translate(128, 140)`}>
              <line
                x1="0"
                y1="0"
                x2={`${90 * Math.cos((averageRiskScore / 100 * 180 - 90) * Math.PI / 180)}`}
                y2={`${90 * Math.sin((averageRiskScore / 100 * 180 - 90) * Math.PI / 180)}`}
                stroke="#374151"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx="0"
                cy="0"
                r="6"
                fill="#374151"
              />
            </g>
            
            {/* Value display */}
            <text
              x="128"
              y="120"
              textAnchor="middle"
              className="text-2xl font-bold"
              fill={riskColor}
            >
              {Math.round(averageRiskScore)}%
            </text>
          </svg>

          {/* Labels */}
          <div className="absolute bottom-0 left-0 text-xs" style={{ color: 'var(--text-color-secondary)' }}>0%</div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs" style={{ color: 'var(--text-color-secondary)' }}>50%</div>
          <div className="absolute bottom-0 right-0 text-xs" style={{ color: 'var(--text-color-secondary)' }}>100%</div>
        </div>
      </div>

      {/* Risk Level Display */}
      <div className="text-center mb-6">
        <div 
          className="inline-block px-6 py-2 rounded-lg"
          style={{ 
            backgroundColor: 'var(--config-input-bg)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div 
            className="text-lg font-medium"
            style={{ color: riskColor }}
          >
            {riskLevel}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* NIST Score */}
        <div 
          className="p-4 rounded-lg"
          style={{ 
            backgroundColor: 'var(--config-input-bg)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="font-medium text-sm"
              style={{ color: 'var(--text-color)' }}
            >
              NIST Score
            </span>
            <span 
              className="w-3 h-3 rounded-full border flex items-center justify-center text-xs"
              style={{ 
                borderColor: 'var(--text-color-secondary)',
                color: 'var(--text-color-secondary)'
              }}
            >
              ?
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${nistScore}%`,
                  backgroundColor: getRiskColor(nistScore)
                }}
              />
            </div>
            <span 
              className="font-bold text-sm"
              style={{ color: 'var(--text-color)' }}
            >
              {nistScore.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* OWASP Score */}
        <div 
          className="p-4 rounded-lg"
          style={{ 
            backgroundColor: 'var(--config-input-bg)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="font-medium text-sm"
              style={{ color: 'var(--text-color)' }}
            >
              OWASP Score
            </span>
            <span 
              className="w-3 h-3 rounded-full border flex items-center justify-center text-xs"
              style={{ 
                borderColor: 'var(--text-color-secondary)',
                color: 'var(--text-color-secondary)'
              }}
            >
              ?
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${owaspScore}%`,
                  backgroundColor: getRiskColor(owaspScore)
                }}
              />
            </div>
            <span 
              className="font-bold text-sm"
              style={{ color: 'var(--text-color)' }}
            >
              {owaspScore.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Successful Attacks */}
      <div 
        className="p-4 rounded-lg"
        style={{ 
          backgroundColor: 'var(--config-input-bg)',
          border: '2px solid #f59e0b'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span 
            className="font-medium text-sm"
            style={{ color: 'var(--text-color)' }}
          >
            Successful Attacks
          </span>
          <span 
            className="w-3 h-3 rounded-full border flex items-center justify-center text-xs"
            style={{ 
              borderColor: 'var(--text-color-secondary)',
              color: 'var(--text-color-secondary)'
            }}
          >
            ?
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${successfulAttacks}%`,
                backgroundColor: getRiskColor(successfulAttacks)
              }}
            />
          </div>
          <span 
            className="font-bold text-sm"
            style={{ color: 'var(--text-color)' }}
          >
            {successfulAttacks.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiskScoreGauge;
