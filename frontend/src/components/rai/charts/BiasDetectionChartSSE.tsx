/**
 * ⚖️ Bias Detection Chart with SSE Integration
 * 
 * Real-time bias detection chart that consumes data from the backend
 * via Server-Sent Events using the Event-Driven Chart Subscription Pattern.
 */

import React, { useState, useEffect } from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer
} from 'recharts';
import { Scale, TrendingUp, Activity } from 'lucide-react';
import { useSSEChart } from '../../../hooks/useSSEChart';
import { useBiasDetectionHistory } from '../../../hooks/useGuardrailsHistory';

interface BiasCategory {
  name: string;
  bias_score: number;
  risk_level: 'low' | 'medium' | 'high';
  trend?: 'up' | 'down' | 'stable';
}

interface BiasMetric {
  category: string;
  score: number;
  threshold: number;
  trend?: 'up' | 'down' | 'stable';
}

interface BiasDetectionChartSSEProps {
  mode?: 'radar' | 'timeseries';
  onModeChange?: (mode: string) => void;
  timeFilter?: string; // Filter from parent (5m, 15m, 1h, 24h, 7d, 30d)
}

const BiasDetectionChartSSE: React.FC<BiasDetectionChartSSEProps> = ({
  mode = 'radar',
  onModeChange,
  timeFilter = '1h'
}) => {
  const [activeMode, setActiveMode] = useState(mode);
  const [biasCategories, setBiasCategories] = useState<Map<string, BiasCategory>>(new Map());
  const [currentFilter, setCurrentFilter] = useState(timeFilter);

  // Fetch historical data based on time filter
  const {
    isLoading: isLoadingHistory,
    aggregatedByCategory: historicalAggregated
  } = useBiasDetectionHistory({
    timeFilter,
    autoFetch: true
  });

  // When filter changes, reset chart and load new data
  useEffect(() => {
    if (timeFilter !== currentFilter) {
      // Filter changed - reset chart immediately
      setBiasCategories(new Map());
      setCurrentFilter(timeFilter);
    }
  }, [timeFilter, currentFilter]);

  // Load historical data when ready
  useEffect(() => {
    if (!isLoadingHistory && historicalAggregated) {
      // Convert aggregated historical data to BiasCategory format
      const historicalCategories = new Map<string, BiasCategory>();
      
      historicalAggregated.forEach((value, categoryName) => {
        historicalCategories.set(categoryName, {
          name: categoryName,
          bias_score: value.bias_score,
          risk_level: value.risk_level,
          trend: value.trend
        });
      });
      
      // Set chart data (replaces whatever is there - zero or non-zero)
      setBiasCategories(historicalCategories);
    }
  }, [isLoadingHistory, currentFilter]);

  // SSE Connection for real-time bias detection updates
  const { 
    isConnected, 
    error,
    lastUpdate 
  } = useSSEChart({
    eventType: 'bias_category_data',
    onData: (newData: any) => {
      if (newData.type === 'bias_category_data') {
        // Add SSE data to chart (use latest values)
        setBiasCategories(prev => {
          const updated = new Map(prev);
          
          updated.set(newData.category_name, {
            name: newData.category_name,
            bias_score: newData.bias_score,
            risk_level: newData.risk_level,
            trend: newData.trend
          });
          
          return updated;
        });
      }
    }
  });

  // Convert bias categories to chart format
  const categoryArray = Array.from(biasCategories.values());
  
  // Default categories to show even when no data
  const defaultCategories = [
    'Gender',
    'Race/Ethnicity',
    'Age',
    'Socioeconomic',
    'Geographic',
    'Language',
    'Disability',
    'Religion'
  ];
  
  // If we have data, use it; otherwise show default structure with zeros
  const chartData: BiasMetric[] = categoryArray.length > 0
    ? categoryArray.map(cat => ({
        category: cat.name,
        score: cat.bias_score,
        threshold: 30,
        trend: cat.trend
      }))
    : defaultCategories.map(cat => ({
        category: cat,
        score: 0,
        threshold: 30,
        trend: 'stable' as const
      }));

  // Calculate risk level counts
  const riskCounts = {
    low: categoryArray.filter(c => c.risk_level === 'low').length,
    medium: categoryArray.filter(c => c.risk_level === 'medium').length,
    high: categoryArray.filter(c => c.risk_level === 'high').length
  };

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
            <RadarChart data={chartData} margin={{ top: 60, right: 60, bottom: 60, left: 60 }}>
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
        {chartData.map((metric) => (
          <div key={metric.category} className="relative group">
            {/* RAI theme card background */}
            <div className="absolute inset-0 bg-white rounded-lg shadow-sm"></div>
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
                  {metric.score.toFixed(2)}%
                </span>
                {getTrendIcon(metric.trend)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale size={20} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Bias Detection Analysis</h3>
          {isConnected && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              <Activity size={12} />
              Live
            </div>
          )}
          {isLoadingHistory && (
            <div className="text-xs text-gray-500">Loading...</div>
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
        </div>
      </div>

      {/* Chart Content */}
      <div className="bg-white rounded-lg p-4">
        {renderRadarChart()}
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
            <div className="text-green-600 text-xs font-medium">{riskCounts.low} categories</div>
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
            <div className="text-yellow-600 text-xs font-medium">{riskCounts.medium} categories</div>
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
            <div className="text-red-600 text-xs font-medium">{riskCounts.high} {riskCounts.high === 1 ? 'category' : 'categories'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiasDetectionChartSSE;
