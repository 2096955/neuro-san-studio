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

import React, { useState } from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Scale, TrendingUp, Activity, TestTube } from 'lucide-react';

interface BiasMetric {
  category: string;
  score: number;
  threshold: number;
  trend?: 'up' | 'down' | 'stable';
}

interface TimeSeriesData {
  timestamp: string;
  overall: number;
  gender: number;
  race: number;
  age: number;
  socioeconomic: number;
}

interface BiasDetectionChartProps {
  mode?: 'radar' | 'timeseries' | 'heatmap';
  data?: BiasMetric[];
  timeSeriesData?: TimeSeriesData[];
  isRealTime?: boolean;
  onModeChange?: (mode: string) => void;
}

const BiasDetectionChart: React.FC<BiasDetectionChartProps> = ({
  mode = 'radar',
  data,
  timeSeriesData,
  isRealTime = false,
  onModeChange
}) => {
  const [activeMode, setActiveMode] = useState(mode);

  // Default bias metrics data
  const defaultBiasData: BiasMetric[] = data || [
    { category: 'Gender', score: 15, threshold: 30, trend: 'down' },
    { category: 'Race/Ethnicity', score: 22, threshold: 30, trend: 'stable' },
    { category: 'Age', score: 8, threshold: 30, trend: 'down' },
    { category: 'Socioeconomic', score: 35, threshold: 30, trend: 'up' },
    { category: 'Geographic', score: 12, threshold: 30, trend: 'stable' },
    { category: 'Language', score: 18, threshold: 30, trend: 'down' },
    { category: 'Disability', score: 25, threshold: 30, trend: 'stable' },
    { category: 'Religion', score: 10, threshold: 30, trend: 'down' }
  ];

  // Default time series data
  const defaultTimeSeriesData: TimeSeriesData[] = timeSeriesData || [
    { timestamp: '09:00', overall: 18, gender: 15, race: 22, age: 8, socioeconomic: 35 },
    { timestamp: '09:15', overall: 20, gender: 18, race: 25, age: 12, socioeconomic: 32 },
    { timestamp: '09:30', overall: 16, gender: 12, race: 20, age: 10, socioeconomic: 28 },
    { timestamp: '09:45', overall: 22, gender: 20, race: 28, age: 15, socioeconomic: 38 },
    { timestamp: '10:00', overall: 19, gender: 16, race: 24, age: 11, socioeconomic: 30 },
    { timestamp: '10:15', overall: 17, gender: 14, race: 21, age: 9, socioeconomic: 29 }
  ];

  const handleModeChange = (newMode: string) => {
    setActiveMode(newMode as any);
    onModeChange?.(newMode);
  };

  const getScoreColor = (score: number, threshold: number) => {
    if (score <= threshold * 0.5) return '#10b981'; // Green - Good
    if (score <= threshold) return '#f59e0b'; // Yellow - Caution
    return '#ef4444'; // Red - Critical
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={12} className="text-red-500" />;
      case 'down': return <TrendingUp size={12} className="text-green-500 rotate-180" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const renderRadarChart = () => (
    <div className="space-y-6">
      <div className="h-[600px] relative">
        {/* RAI theme background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-purple-100/50 to-purple-50 rounded-2xl border border-purple-200"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05)_0%,transparent_70%)] rounded-2xl"></div>
        
        {/* Chart container */}
        <div className="relative z-10 h-full p-6">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={defaultBiasData} margin={{ top: 60, right: 60, bottom: 60, left: 60 }}>
              {/* Enhanced grid with sci-fi styling */}
              <PolarGrid 
                stroke="rgba(139, 92, 246, 0.3)" 
                strokeWidth={1}
                radialLines={true}
              />
              
              {/* Category labels with RAI theme styling */}
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ 
                  fontSize: 13, 
                  fill: '#374151',
                  fontWeight: 600,
                  textAnchor: 'middle'
                }}
                tickFormatter={(value) => value.replace('/', '/\n')}
              />
              
              {/* Radius axis with RAI theme styling */}
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 50]} 
                tick={{ 
                  fontSize: 11, 
                  fill: '#6b7280',
                  fontWeight: 500
                }}
                tickCount={6}
                stroke="rgba(139, 92, 246, 0.2)"
              />
              
              {/* Threshold radar with sci-fi glow */}
              <Radar
                name="Critical Threshold"
                dataKey="threshold"
                stroke="#ef4444"
                fill="rgba(239, 68, 68, 0.1)"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
              
              {/* Main bias score radar with enhanced styling */}
              <Radar
                name="Current Bias Level"
                dataKey="score"
                stroke="#8b5cf6"
                fill="url(#biasGradient)"
                strokeWidth={3}
                dot={{ 
                  fill: '#8b5cf6', 
                  strokeWidth: 2, 
                  r: 5,
                  stroke: '#ffffff'
                }}
              />
              
              {/* Custom gradient definitions */}
              <defs>
                <radialGradient id="biasGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
                  <stop offset="50%" stopColor="rgba(139, 92, 246, 0.2)" />
                  <stop offset="100%" stopColor="rgba(139, 92, 246, 0.05)" />
                </radialGradient>
              </defs>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
      </div>
      
      {/* Enhanced Bias Categories Summary with RAI theme */}
      <div className="grid grid-cols-2 gap-4">
        {defaultBiasData.map((metric) => (
          <div key={metric.category} className="relative group">
            {/* RAI theme card background */}
            <div className="absolute inset-0 bg-white rounded-lg  shadow-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 via-transparent to-purple-50/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Card content */}
            <div className="relative flex items-center justify-between p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ 
                      backgroundColor: getScoreColor(metric.score, metric.threshold)
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">{metric.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {metric.score}%
                </span>
                {getTrendIcon(metric.trend)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeSeriesChart = () => (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={defaultTimeSeriesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
          />
          <YAxis 
            domain={[0, 50]}
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px'
            }}
          />
          <Legend />
          
          {/* Threshold zones */}
          <ReferenceLine y={15} stroke="#10b981" strokeDasharray="2 2" label="Good" />
          <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="2 2" label="Caution" />
          
          <Line 
            type="monotone" 
            dataKey="overall" 
            stroke="var(--color-primary)" 
            strokeWidth={3}
            name="Overall Bias"
          />
          <Line 
            type="monotone" 
            dataKey="gender" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            name="Gender"
          />
          <Line 
            type="monotone" 
            dataKey="race" 
            stroke="#06b6d4" 
            strokeWidth={2}
            name="Race"
          />
          <Line 
            type="monotone" 
            dataKey="age" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Age"
          />
          <Line 
            type="monotone" 
            dataKey="socioeconomic" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Socioeconomic"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale size={20} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Bias Detection Analysis</h3>
          {isRealTime && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              <Activity size={12} />
              Live
            </div>
          )}
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleModeChange('radar')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeMode === 'radar'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleModeChange('timeseries')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeMode === 'timeseries'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Trends
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="bg-white rounded-lg p-4">
        {activeMode === 'radar' && renderRadarChart()}
        {activeMode === 'timeseries' && renderTimeSeriesChart()}
      </div>

      {/* Enhanced Status Summary with RAI theme */}
      <div className="grid grid-cols-3 gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-green-50 rounded-xl border border-green-200"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="text-green-800 font-bold text-sm">LOW RISK</div>
            </div>
            <div className="text-green-600 text-xs font-medium">5 categories</div>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-yellow-50 rounded-xl border border-yellow-200"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/50 to-orange-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="text-yellow-800 font-bold text-sm">MEDIUM RISK</div>
            </div>
            <div className="text-yellow-600 text-xs font-medium">2 categories</div>
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-red-50 rounded-xl border border-red-200"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-pink-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="text-red-800 font-bold text-sm">HIGH RISK</div>
            </div>
            <div className="text-red-600 text-xs font-medium">1 category</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiasDetectionChart;
