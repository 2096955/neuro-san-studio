// Copyright (c) 2024 Windsurf AI
// 
// This file is part of the Windsurf project.
// 
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
//
// END COPYRIGHT

import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RADIAN = Math.PI / 180;

// Custom needle component that works with ResponsiveContainer
const ResponsiveNeedle = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, value, data } = props;
  
  if (!cx || !cy) return null;
  
  const total = data.reduce((sum: number, entry: any) => sum + entry.value, 0);
  const ang = 180.0 * (1 - value / total);
  const length = (innerRadius + 2 * outerRadius) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = Math.max(3, Math.min(cx, cy) * 0.02); // Scale radius with container size
  
  const x0 = cx;
  const y0 = cy;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return (
    <g>
      <circle cx={x0} cy={y0} r={r} fill="#374151" stroke="none" />
      <path
        d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
        stroke="none"
        fill="#374151"
      />
    </g>
  );
};

interface TrustMetric {
  name: string;
  value: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
}

interface TrustScoreChartView1Props {
  isRealTime?: boolean;
  isStressTest?: boolean;
  size?: number;
  trustScore?: number;
  onClick?: () => void;
  onMetricClick?: (metricName: string) => void;
}


const TrustScoreChartView1: React.FC<TrustScoreChartView1Props> = ({
  isRealTime = false,
  isStressTest = false,
  trustScore,
  onClick,
  onMetricClick
}) => {
  const [metrics, setMetrics] = useState<TrustMetric[]>([
    { name: 'AI Safety', value: 85, color: '#8b5cf6', trend: 'up', riskLevel: 'low' },
    { name: 'Performance', value: 82, color: '#06b6d4', trend: 'stable', riskLevel: 'low' },
    { name: 'Security', value: 72, color: '#10b981', trend: 'down', riskLevel: 'medium' },
    { name: 'Compliance', value: 74, color: '#f59e0b', trend: 'up', riskLevel: 'medium' }
  ]);

  const [overallScore, setOverallScore] = useState<number | undefined>(trustScore);

  // Update overall score when trustScore prop changes
  useEffect(() => {
    if (!isRealTime && trustScore !== undefined) {
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

  useEffect(() => {
    if (!isRealTime) {
      setOverallScore(trustScore);
      return;
    }

    // In realtime mode, calculate from metrics average
    const newOverallScore = Math.round(
      metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length
    );
    setOverallScore(newOverallScore);
  }, [metrics, isRealTime, trustScore]);

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

  const handleMetricClick = useCallback((metricName: string) => {
    onMetricClick?.(metricName);
  }, [onMetricClick]);

  // Create data for the semicircle gauge
  const chartData = [
    { name: 'Low', value: 40, color: '#ef4444' }, // Red - 0-39
    { name: 'Medium', value: 40, color: '#f59e0b' }, // Amber - 40-79  
    { name: 'High', value: 20, color: '#10b981' }, // Green - 80-100
  ];

  return (
    <div className="w-full">
      {(isRealTime || isStressTest) && (
        <div className="flex items-center justify-end gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${isStressTest ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
          <span className="text-xs text-gray-500 font-medium">
            {isStressTest ? 'STRESS TEST' : 'LIVE DATA'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gauge Chart */}
        <div className="relative w-full">
          <div 
            className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity w-full"
            onClick={onClick}
          >
            <div className="relative w-full max-w-sm">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    startAngle={180}
                    endAngle={0}
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="70%"
                    stroke="none"
                    isAnimationActive={true}
                    animationDuration={800}
                  >
                    {chartData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Responsive Needle Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                  <ResponsiveNeedle 
                    value={overallScore ?? 0} 
                    data={chartData} 
                    cx={50}
                    cy={50}
                    innerRadius={20}
                    outerRadius={35}
                  />
                </svg>
              </div>

              {/* Score display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center top-16">
                <div className={`text-2xl sm:text-3xl font-bold ${overallScore !== undefined ? getScoreColor(overallScore) : 'text-gray-400'}`}>
                  {overallScore !== undefined ? Math.round(overallScore) : '—'}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">
                  Trust Score
                </div>
                {(isRealTime || isStressTest) && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${isStressTest ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                    <span className="text-xs text-gray-500">
                      {isStressTest ? 'STRESS' : 'LIVE'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Score ranges indicator */}
            <div className="flex items-center gap-2 sm:gap-4 mt-4 text-xs flex-wrap justify-center">
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
        </div>

        {/* Metrics Breakdown */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            Component Metrics
          </h4>
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className="space-y-0.5 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
              onClick={() => handleMetricClick(metric.name)}
            >
              {/* Metric Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
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

export default TrustScoreChartView1;
