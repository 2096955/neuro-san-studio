// Copyright (c) 2024 Windsurf AI
// 
// This file is part of the Windsurf project.
// 
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
//
// END COPYRIGHT

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface TrustMetric {
  name: string;
  value: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
}

interface TrustScoreChartView2Props {
  isRealTime?: boolean;
  isStressTest?: boolean;
  size?: number;
  trustScore?: number;
  onClick?: () => void;
  onMetricClick?: (metricName: string) => void;
}

const TrustScoreChartView2: React.FC<TrustScoreChartView2Props> = ({
  isRealTime = false,
  isStressTest = false,
  size = 400,
  trustScore = 78,
  onClick,
  onMetricClick
}) => {
  const [metrics, setMetrics] = useState<TrustMetric[]>([
    { name: 'AI Safety', value: 85, color: '#8b5cf6', trend: 'up', riskLevel: 'low' },
    { name: 'Performance', value: 82, color: '#06b6d4', trend: 'stable', riskLevel: 'low' },
    { name: 'Security', value: 72, color: '#10b981', trend: 'down', riskLevel: 'medium' },
    { name: 'Compliance', value: 74, color: '#f59e0b', trend: 'up', riskLevel: 'medium' }
  ]);

  const [overallScore, setOverallScore] = useState(trustScore);

  // Update overall score when trustScore prop changes
  useEffect(() => {
    if (!isRealTime) {
      setOverallScore(trustScore);
    }
  }, [trustScore, isRealTime]);

  // Simulate live data updates
  useEffect(() => {
    if (!isRealTime && !isStressTest) return;

    const interval = setInterval(() => {
      setMetrics(prevMetrics => {
        const newMetrics = prevMetrics.map(metric => {
          let newValue = metric.value;
          let newTrend = metric.trend;
          
          if (isStressTest) {
            // Stress test mode - more volatile changes, generally trending down
            const change = (Math.random() - 0.7) * 8; // Bias towards negative
            newValue = Math.max(20, Math.min(100, metric.value + change));
            newTrend = change > 1 ? 'up' : change < -1 ? 'down' : 'stable';
          } else {
            // Real-time mode - smaller, more realistic changes
            const change = (Math.random() - 0.5) * 3;
            newValue = Math.max(50, Math.min(100, metric.value + change));
            newTrend = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable';
          }

          return {
            ...metric,
            value: Math.round(newValue),
            trend: newTrend,
            riskLevel: newValue >= 80 ? 'low' : newValue >= 65 ? 'medium' : 'high' as 'low' | 'medium' | 'high'
          };
        });
        
        // Only update if values actually changed to prevent unnecessary re-renders
        const hasChanged = newMetrics.some((metric, index) => 
          metric.value !== prevMetrics[index].value || 
          metric.trend !== prevMetrics[index].trend
        );
        
        return hasChanged ? newMetrics : prevMetrics;
      });
    }, isStressTest ? 1000 : 3000); // Faster updates during stress test

    return () => clearInterval(interval);
  }, [isRealTime, isStressTest]);

  // Calculate overall score from metrics
  useEffect(() => {
    const avgScore = metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length;
    setOverallScore(Math.round(avgScore));
  }, [metrics]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg z-10 relative">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">Score: {data.value}%</p>
          <p className="text-sm text-gray-600">
            Trend: {getTrendIcon(data.trend)} {data.trend}
          </p>
          <p className={`text-sm font-medium ${getRiskColor(data.riskLevel)}`}>
            Risk: {data.riskLevel.toUpperCase()}
          </p>
        </div>
      );
    }
    return null;
  };


  return (
    <div>
      {(isRealTime || isStressTest) && (
        <div className="flex items-center justify-end gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${isStressTest ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
          <span className="text-xs text-gray-500 font-medium">
            {isStressTest ? 'STRESS TEST' : 'LIVE DATA'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="relative" style={{ width: size, height: size }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={metrics}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={size * 0.35}
                innerRadius={size * 0.25}
                fill="#8884d8"
                dataKey="value"
                onClick={onClick}
                className="cursor-pointer"
                animationBegin={0}
                animationDuration={800}
                isAnimationActive={true}
              >
                {metrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />} 
                wrapperStyle={{ zIndex: 1000 }}
                position={{ x: undefined, y: undefined }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Content */}
          <div 
            className="absolute pointer-events-none z-50"
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`} style={{ lineHeight: '1' }}>
              {Math.round(overallScore)}
            </div>
            <div className="text-sm text-gray-500 font-medium" style={{ marginTop: '4px', lineHeight: '1' }}>
              Trust Score
            </div>
            {(isRealTime || isStressTest) && (
              <div className="flex items-center gap-1" style={{ marginTop: '8px' }}>
                <div className={`w-2 h-2 rounded-full ${isStressTest ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                <span className="text-xs text-gray-500 font-medium">
                  {isStressTest ? 'STRESS TEST' : 'LIVE'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Breakdown */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            Component Metrics
          </h4>
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className="space-y-0.5 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors duration-200"
              onClick={() => onMetricClick?.(metric.name)}
            >
              {/* Metric Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: metric.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-800">{metric.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${getScoreColor(metric.value)}`}>
                    {metric.value}%
                  </span>
                  <span className="text-xs">{getTrendIcon(metric.trend)}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="h-1 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${metric.value}%`,
                      backgroundColor: metric.color
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Risk Level */}
              <div className="flex justify-start">
                <span className={`text-xs font-medium ${getRiskColor(metric.riskLevel)}`}>
                  {metric.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            </div>
          ))}

          {/* Overall Status */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Overall Status</p>
                <p className={`text-xs ${overallScore >= 80 ? 'text-green-600' : overallScore >= 65 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {overallScore >= 80 ? 'EXCELLENT' : overallScore >= 65 ? 'GOOD' : 'NEEDS ATTENTION'}
                </p>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {Math.round(overallScore)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustScoreChartView2;
