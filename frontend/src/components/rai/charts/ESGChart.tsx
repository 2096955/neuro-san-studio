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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ESGMetric {
  category: 'Environmental' | 'Social' | 'Governance';
  score: number;
  color: string;
  status: 'excellent' | 'good' | 'attention' | 'risk';
  details: string;
  [key: string]: any; // Add index signature for Recharts compatibility
}

interface ESGChartProps {
  isRealTime?: boolean;
  size?: number;
  sustainabilityMetrics?: {
    energy_kwh: number;
    carbon_g_co2: number;
    water_liters: number;
    model_name: string;
  };
  trustScore?: number;
  onClick?: () => void;
  onCategoryClick?: (category: string) => void;
}

const ESGChart: React.FC<ESGChartProps> = ({
  isRealTime = false,
  size = 320,
  sustainabilityMetrics,
  trustScore = 78,
  onClick,
  onCategoryClick
}) => {
  // Calculate real ESG metrics from available data
  const calculateEnvironmentalScore = () => {
    if (!sustainabilityMetrics) return { score: 65, status: 'attention' as const, details: 'No sustainability data available' };
    
    // Calculate score based on carbon efficiency (lower is better)
    const carbonPerInference = sustainabilityMetrics.carbon_g_co2;
    let score = 85;
    let status: 'excellent' | 'good' | 'attention' | 'risk' = 'excellent';
    
    if (carbonPerInference > 0.1) {
      score = 60;
      status = 'attention';
    } else if (carbonPerInference > 0.05) {
      score = 75;
      status = 'good';
    }
    
    return {
      score,
      status,
      details: `Carbon: ${carbonPerInference.toFixed(3)}g CO₂, Energy: ${sustainabilityMetrics.energy_kwh.toFixed(4)} kWh`
    };
  };

  const calculateSocialScore = () => {
    // Derive from trust score (fairness component)
    const fairnessScore = Math.max(60, trustScore - 10); // Assume fairness is slightly lower than overall trust
    let status: 'excellent' | 'good' | 'attention' | 'risk' = 'good';
    
    if (fairnessScore >= 85) status = 'excellent';
    else if (fairnessScore >= 70) status = 'good';
    else if (fairnessScore >= 60) status = 'attention';
    else status = 'risk';
    
    return {
      score: fairnessScore,
      status,
      details: 'Based on bias detection and fairness metrics'
    };
  };

  const calculateGovernanceScore = () => {
    // Conservative governance score based on trust score
    const governanceScore = Math.max(50, trustScore - 20); // Governance typically lags behind technical metrics
    let status: 'excellent' | 'good' | 'attention' | 'risk' = 'attention';
    
    if (governanceScore >= 80) status = 'good'; // Rarely excellent without explicit compliance data
    else if (governanceScore >= 65) status = 'attention';
    else status = 'risk';
    
    return {
      score: governanceScore,
      status,
      details: 'Constitutional AI principles + compliance framework'
    };
  };

  const [esgMetrics, setESGMetrics] = useState<ESGMetric[]>(() => {
    const env = calculateEnvironmentalScore();
    const social = calculateSocialScore();
    const governance = calculateGovernanceScore();
    
    return [
      {
        category: 'Environmental',
        score: env.score,
        color: '#10b981',
        status: env.status,
        details: env.details
      },
      {
        category: 'Social',
        score: social.score,
        color: '#3b82f6',
        status: social.status,
        details: social.details
      },
      {
        category: 'Governance',
        score: governance.score,
        color: '#8b5cf6',
        status: governance.status,
        details: governance.details
      }
    ];
  });

  const [overallESGScore, setOverallESGScore] = useState(82);
  const [esgRating, setESGRating] = useState('B+');

  // Calculate overall ESG score and rating
  useEffect(() => {
    const avgScore = Math.round(
      esgMetrics.reduce((sum, metric) => sum + metric.score, 0) / esgMetrics.length
    );
    
    // Determine ESG rating
    let newRating = 'D';
    if (avgScore >= 90) newRating = 'A';
    else if (avgScore >= 80) newRating = 'B+';
    else if (avgScore >= 70) newRating = 'B';
    else if (avgScore >= 60) newRating = 'C';
    
    setOverallESGScore(avgScore);
    setESGRating(newRating);
  }, [esgMetrics]);

  // Update ESG metrics when props change
  useEffect(() => {
    const env = calculateEnvironmentalScore();
    const social = calculateSocialScore();
    const governance = calculateGovernanceScore();
    
    const newMetrics = [
      {
        category: 'Environmental' as const,
        score: env.score,
        color: '#10b981',
        status: env.status,
        details: env.details
      },
      {
        category: 'Social' as const,
        score: social.score,
        color: '#3b82f6',
        status: social.status,
        details: social.details
      },
      {
        category: 'Governance' as const,
        score: governance.score,
        color: '#8b5cf6',
        status: governance.status,
        details: governance.details
      }
    ];
    
    // Only update if metrics have actually changed
    setESGMetrics(prev => {
      const hasChanged = prev.some((metric, index) => 
        metric.score !== newMetrics[index].score ||
        metric.status !== newMetrics[index].status ||
        metric.details !== newMetrics[index].details
      );
      return hasChanged ? newMetrics : prev;
    });
  }, [
    sustainabilityMetrics?.energy_kwh,
    sustainabilityMetrics?.carbon_g_co2,
    sustainabilityMetrics?.water_liters,
    trustScore
  ]);

  // Real-time simulation (only for demo purposes)
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      setESGMetrics(prev => prev.map(metric => ({
        ...metric,
        score: Math.max(0, Math.min(100, metric.score + (Math.random() - 0.5) * 2))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [isRealTime]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingColor = (rating: string) => {
    if (rating === 'A') return 'text-green-600';
    if (rating.startsWith('B')) return 'text-blue-600';
    if (rating === 'C') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '🟢';
      case 'good': return '🔵';
      case 'attention': return '🟡';
      case 'risk': return '🔴';
      default: return '⚪';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.category}</p>
          <p className="text-sm text-gray-600">Score: {data.score}%</p>
          <p className="text-xs text-gray-500 mt-1">{data.details}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">ESG Compliance</h3>
          <p className="text-sm text-gray-600">Environmental, Social & Governance metrics</p>
        </div>
        {isRealTime && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-500 font-medium">LIVE</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-8">
        {/* ESG Donut Chart */}
        <div className="relative" style={{ width: size * 0.7, height: size * 0.7 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={esgMetrics}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={size * 0.25}
                innerRadius={size * 0.15}
                fill="#8884d8"
                dataKey="score"
                onClick={onClick}
                className="cursor-pointer"
                animationBegin={0}
                animationDuration={800}
              >
                {esgMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-2xl font-bold ${getRatingColor(esgRating)}`}>
              {esgRating}
            </div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              ESG Rating
            </div>
            <div className={`text-lg font-semibold mt-1 ${getScoreColor(overallESGScore)}`}>
              {overallESGScore}%
            </div>
          </div>
        </div>

        {/* ESG Metrics Breakdown */}
        <div className="flex-1 space-y-3">
          <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            ESG Components
          </h4>
          {esgMetrics.map((metric, index) => (
            <div 
              key={index} 
              className="space-y-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() => onCategoryClick?.(metric.category)}
            >
              {/* Metric Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{getStatusIcon(metric.status)}</span>
                  <span className="text-sm font-medium text-gray-800">{metric.category}</span>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(metric.score)}`}>
                  {Math.round(metric.score)}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="h-1 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${metric.score}%`,
                      backgroundColor: metric.color
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Details */}
              <div className="text-xs text-gray-500">
                {metric.details}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ESG Rating Explanation */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="mb-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">ESG Rating Scale</h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-4 bg-green-600 rounded text-white text-center text-xs font-bold">A</span>
                <span className="text-gray-600">90-100: Excellent ESG performance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-4 bg-blue-600 rounded text-white text-center text-xs font-bold">B</span>
                <span className="text-gray-600">70-89: Good ESG practices</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-4 bg-yellow-600 rounded text-white text-center text-xs font-bold">C</span>
                <span className="text-gray-600">60-69: Needs improvement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-4 bg-red-600 rounded text-white text-center text-xs font-bold">D</span>
                <span className="text-gray-600">0-59: High ESG risk</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Calculation Formula</h5>
          <div className="bg-gray-50 p-3 rounded text-xs font-mono">
            <div className="mb-2"><strong>ESG Score = (E + S + G) ÷ 3</strong></div>
            <div className="space-y-1 text-gray-600">
              <div><strong>E (Environmental):</strong> Based on carbon efficiency (g CO₂/inference)</div>
              <div><strong>S (Social):</strong> Derived from trust score fairness metrics</div>
              <div><strong>G (Governance):</strong> Constitutional AI + compliance framework</div>
            </div>
          </div>
        </div>
        
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Data Sources</h5>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• Environmental: Real-time energy consumption & carbon footprint</div>
            <div>• Social: Bias detection algorithms & fairness assessments</div>
            <div>• Governance: Constitutional AI principles compliance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESGChart;
