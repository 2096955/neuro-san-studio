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

import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

interface TrustMetric {
  name: string;
  score: number;
  weight: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  icon: string;
}

interface TrustScoreData {
  overallScore: number;
  metrics: TrustMetric[];
  lastUpdated: string;
  agentName?: string;
}

const TrustScore = ({ agentName, trustScore }: { agentName?: string; trustScore?: number }) => {
  const [trustData, setTrustData] = useState<TrustScoreData>({
    overallScore: trustScore || 87,
    lastUpdated: new Date().toISOString(),
    metrics: [
      {
        name: 'AI Safety',
        score: 94,
        weight: 0.35,
        status: 'excellent',
        description: 'Bias detection, content filtering, ethical compliance',
        icon: '🛡️'
      },
      {
        name: 'Performance',
        score: 89,
        weight: 0.25,
        status: 'good',
        description: 'Response time, efficiency, resource utilization',
        icon: '⚡'
      },
      {
        name: 'Security',
        score: 82,
        weight: 0.25,
        status: 'good',
        description: 'Adversarial resistance, prompt injection protection',
        icon: '🔒'
      },
      {
        name: 'Reliability',
        score: 85,
        weight: 0.15,
        status: 'good',
        description: 'Success rate, consistency, error handling',
        icon: '✅'
      }
    ]
  });

  const [loading, setLoading] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    return '🔴';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      excellent: { color: '#10b981', text: 'Excellent' },
      good: { color: '#3b82f6', text: 'Good' },
      warning: { color: '#f59e0b', text: 'Warning' },
      critical: { color: '#ef4444', text: 'Critical' }
    };
    return badges[status as keyof typeof badges] || badges.good;
  };

  // Calculate overall score based on weighted metrics
  const calculateOverallScore = (metrics: TrustMetric[]) => {
    return metrics.reduce((total, metric) => total + (metric.score * metric.weight), 0);
  };

  // Sync trustScore from props; no random simulation.
  useEffect(() => {
    if (trustScore !== undefined) {
      setTrustData(prev => ({
        ...prev,
        overallScore: trustScore,
        lastUpdated: new Date().toISOString()
      }));
    }
  }, [trustScore]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trust Score Overview Card */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        style={{ 
          backgroundColor: 'var(--config-input-bg)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 text-white"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-lg">🛡️</span>
            <h3 className="text-lg font-semibold">Trust Score</h3>
            {agentName && (
              <span className="text-sm opacity-75">- {agentName}</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Overall Score */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-4xl">{getScoreIcon(trustData.overallScore)}</span>
              <div 
                className="text-5xl font-bold"
                style={{ color: getScoreColor(trustData.overallScore) }}
              >
                {Math.round(trustData.overallScore)}
              </div>
            </div>
            <p 
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--text-color)' }}
            >
              Overall Trust Score
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${trustData.overallScore}%`,
                  backgroundColor: getScoreColor(trustData.overallScore)
                }}
              ></div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
            <p 
              className="text-xs"
              style={{ color: 'var(--text-color-secondary)' }}
            >
              Last updated: {new Date(trustData.lastUpdated).toLocaleTimeString()}
            </p>
            {loading && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs" style={{ color: 'var(--text-color-secondary)' }}>
                  Updating...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Metrics Card */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        style={{ 
          backgroundColor: 'var(--config-input-bg)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 text-white"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold">Metric Breakdown</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {trustData.metrics.map((metric, index) => {
            const badge = getStatusBadge(metric.status);
            return (
              <div key={index} className="space-y-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--config-input-bg)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{metric.icon}</span>
                    <div>
                      <span style={{ color: 'var(--text-color)' }} className="font-medium text-sm">
                        {metric.name}
                      </span>
                      <span 
                        className="ml-2 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: badge.color + '20',
                          color: badge.color
                        }}
                      >
                        {badge.text}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getScoreIcon(metric.score)}</span>
                    <span 
                      className="font-bold text-lg"
                      style={{ color: getScoreColor(metric.score) }}
                    >
                      {Math.round(metric.score)}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${metric.score}%`,
                      backgroundColor: getScoreColor(metric.score)
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--text-color-secondary)' }}
                  >
                    {metric.description}
                  </p>
                  <span 
                    className="text-xs font-medium"
                    style={{ color: 'var(--text-color-secondary)' }}
                  >
                    Weight: {Math.round(metric.weight * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrustScore;
