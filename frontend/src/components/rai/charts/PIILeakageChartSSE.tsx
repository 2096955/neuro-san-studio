/**
 * 🔒 PII Leakage Chart with SSE Integration
 * 
 * Real-time PII leakage detection chart that consumes data from the backend
 * via Server-Sent Events using the Event-Driven Chart Subscription Pattern.
 */

import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { Lock, Shield, AlertTriangle, Activity, Eye } from 'lucide-react';
import { useSSEChart } from '../../../hooks/useSSEChart';
import { useGuardrailsHistory } from '../../../hooks/useGuardrailsHistory';

interface PIICategory {
  name: string;
  detected: number;
  blocked: number;
  leaked: number;
  severity: 'low' | 'medium' | 'high';
}

interface TimeSeriesData {
  timestamp: string;
  email: number;
  phone: number;
  ssn: number;
  creditCard: number;
  address: number;
  total: number;
}

interface PIILeakageChartSSEProps {
  mode?: 'donut' | 'timeseries';
  onModeChange?: (mode: string) => void;
  timeFilter?: string; // Filter from parent (5m, 1h, 24h, 7d, 30d)
}

const PIILeakageChartSSE: React.FC<PIILeakageChartSSEProps> = ({
  mode = 'donut',
  onModeChange,
  timeFilter = '1h'
}) => {
  const [activeMode, setActiveMode] = useState(mode);
  const [piiCategories, setPiiCategories] = useState<Map<string, PIICategory>>(new Map());
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [currentFilter, setCurrentFilter] = useState(timeFilter);

  // Fetch historical data based on time filter
  const {
    isLoading: isLoadingHistory,
    aggregatedByCategory: historicalAggregated
  } = useGuardrailsHistory({
    timeFilter,
    autoFetch: true
  });

  // When filter changes, reset chart and load new data
  useEffect(() => {
    if (timeFilter !== currentFilter) {
      // Filter changed - reset chart immediately
      setPiiCategories(new Map());
      setCurrentFilter(timeFilter);
    }
  }, [timeFilter, currentFilter]);

  // Load historical data when ready
  useEffect(() => {
    if (!isLoadingHistory && historicalAggregated) {
      // Convert aggregated historical data to PIICategory format
      const historicalCategories = new Map<string, PIICategory>();
      
      historicalAggregated.forEach((value, categoryName) => {
        // Determine severity based on category name (matching backend data)
        let severity: 'low' | 'medium' | 'high' = 'medium';
        if (['SSN/Tax IDs', 'Credit Cards', 'Medical IDs', 'Bank Account'].includes(categoryName)) {
          severity = 'high';
        } else if (['Phone Numbers'].includes(categoryName)) {
          severity = 'low';
        }
        
        historicalCategories.set(categoryName, {
          name: categoryName,
          detected: value.detected,
          blocked: value.blocked,
          leaked: value.leaked,
          severity
        });
      });
      
      // Set chart data (replaces whatever is there - zero or non-zero)
      setPiiCategories(historicalCategories);
    }
  }, [isLoadingHistory, currentFilter]);

  // 🎯 Single SSE Connection for all PII data types
  const { 
    isConnected, 
    error,
    lastUpdate 
  } = useSSEChart({
    eventType: 'pii_category_data', // Primary event type
    onData: (newData: any) => {
      // console.log('📊 SSE PII data received:', newData);
      
      if (newData.type === 'pii_category_data') {
        // Add SSE data to chart (cumulative)
        setPiiCategories(prev => {
          const updated = new Map(prev);
          const existing = updated.get(newData.category_name);
          
          if (existing) {
            // Add to existing data (cumulative)
            updated.set(newData.category_name, {
              name: newData.category_name,
              detected: existing.detected + newData.detected,
              blocked: existing.blocked + newData.blocked,
              leaked: existing.leaked + newData.leaked,
              severity: newData.severity
            });
          } else {
            // New category from SSE
            updated.set(newData.category_name, {
              name: newData.category_name,
              detected: newData.detected,
              blocked: newData.blocked,
              leaked: newData.leaked,
              severity: newData.severity
            });
          }
          
          return updated;
        });
      } else if (newData.type === 'pii_timeseries_data') {
        if (newData.full_timeseries) {
          setTimeSeriesData(newData.full_timeseries);
        } else if (newData.data_point) {
          // Add single data point
          setTimeSeriesData(prev => {
            const updated = [...prev, newData.data_point];
            // Keep only last 20 points
            return updated.slice(-20);
          });
        }
      }
    }
  });

  const handleModeChange = (newMode: string) => {
    setActiveMode(newMode as any);
    onModeChange?.(newMode);
  };

  // Convert Map to Array for charts
  const categoryArray = Array.from(piiCategories.values());

  // Prepare donut chart data
  const donutData = categoryArray.map(item => ({
    name: item.name,
    value: item.leaked,
    detected: item.detected,
    blocked: item.blocked,
    severity: item.severity
  }));

  // Debug: Log data state
  // console.log('🔍 Chart Debug:', {
  //   piiCategoriesSize: piiCategories.size,
  //   categoryArrayLength: categoryArray.length,
  //   donutDataLength: donutData.length,
  //   isHistoricalLoaded,
  //   isLoadingHistory,
  //   timeFilter
  // });

  const getSeverityColor = (severity: string, opacity = 1) => {
    switch (severity) {
      case 'high': return `rgba(239, 68, 68, ${opacity})`;
      case 'medium': return `rgba(245, 158, 11, ${opacity})`;
      default: return `rgba(34, 197, 94, ${opacity})`;
    }
  };

  const getTotalLeaked = () => {
    const total = categoryArray.reduce((sum, item) => sum + item.leaked, 0);
    return total;
  };
  
  const getTotalDetected = () => {
    const total = categoryArray.reduce((sum, item) => sum + item.detected, 0);
    return total;
  };
  
  const getTotalBlocked = () => {
    const total = categoryArray.reduce((sum, item) => sum + item.blocked, 0);
    return total;
  };
  
  // Debug: Log totals when they change


  const hasError = error;

  const renderDonutChart = () => (
    <div className="space-y-6">
      <div className="h-[500px] relative">
        {/* RAI theme background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-red-100/50 to-red-50 rounded-2xl border border-red-200"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)] rounded-2xl"></div>
        
        {/* Chart container */}
        <div className="relative z-10 h-full p-6">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Donut Chart */}
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">PII Leakage by Category</h4>
              <div className="flex-1 relative">
                {donutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getSeverityColor(entry.severity)}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, _name: any, props: any) => [
                          `${value} leaked`,
                          `${props.payload.detected} detected, ${props.payload.blocked} blocked`
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Waiting for PII data...</p>
                  </div>
                )}
                
                {/* Center metrics - only show when we have data */}
                {donutData.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{getTotalLeaked()}</div>
                      <div className="text-xs text-gray-600">Total Leaked</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics Panel */}
            <div className="flex flex-col space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">Detection Summary</h4>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Detected</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{getTotalDetected()}</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Blocked</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{getTotalBlocked()}</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-600" />
                      <span className="text-sm font-medium text-gray-700">Leaked</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{getTotalLeaked()}</span>
                  </div>
                </div>
              </div>

              {/* Prevention Rate */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Prevention Rate</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${getTotalDetected() > 0 ? ((getTotalBlocked() / getTotalDetected()) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {getTotalDetected() > 0 ? Math.round((getTotalBlocked() / getTotalDetected()) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Details */}
      <div className="grid grid-cols-2 gap-3">
        {categoryArray.map((category) => (
          <div key={category.name} className="relative group">
            <div className="absolute inset-0 bg-white rounded-lg border border-gray-200 shadow-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 via-transparent to-red-50/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative flex items-center justify-between p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getSeverityColor(category.severity) }}
                />
                <span className="text-sm font-semibold text-gray-700">{category.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-red-600 font-bold">{category.leaked}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{category.detected}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeSeriesChart = () => (
    <div className="h-[500px]">
      {timeSeriesData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            
            {/* Threshold line */}
            <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="2 2" label="Alert Threshold" />
            
            <Area 
              type="monotone" 
              dataKey="email" 
              stackId="1"
              stroke="#f59e0b" 
              fill="rgba(245, 158, 11, 0.3)"
              name="Email"
            />
            <Area 
              type="monotone" 
              dataKey="phone" 
              stackId="1"
              stroke="#06b6d4" 
              fill="rgba(6, 182, 212, 0.3)"
              name="Phone"
            />
            <Area 
              type="monotone" 
              dataKey="ssn" 
              stackId="1"
              stroke="#ef4444" 
              fill="rgba(239, 68, 68, 0.3)"
              name="SSN"
            />
            <Area 
              type="monotone" 
              dataKey="creditCard" 
              stackId="1"
              stroke="#8b5cf6" 
              fill="rgba(139, 92, 246, 0.3)"
              name="Credit Card"
            />
            <Area 
              type="monotone" 
              dataKey="address" 
              stackId="1"
              stroke="#10b981" 
              fill="rgba(16, 185, 129, 0.3)"
              name="Address"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Waiting for timeseries data...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock size={20} className="text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">PII Leakage Detection</h3>
          
          {/* Loading Indicator */}
          {isLoadingHistory && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Loading history...
            </div>
          )}
          
          {/* Historical Data Loaded */}
          {!isLoadingHistory && piiCategories.size > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              Historical ({timeFilter})
            </div>
          )}
          
          {/* SSE Connection Status */}
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Activity size={12} />
            {isConnected ? 'Live' : 'Disconnected'}
          </div>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleModeChange('donut')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeMode === 'donut'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleModeChange('timeseries')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeMode === 'timeseries'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            Trends
          </button>
        </div>
      </div>

      {/* Error Display */}
      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-600">
            Connection Error: {error}
          </p>
        </div>
      )}

      {/* Chart Content */}
      <div className="bg-white rounded-lg p-4">
        {activeMode === 'donut' && renderDonutChart()}
        {activeMode === 'timeseries' && renderTimeSeriesChart()}
      </div>

      {/* Last Update Info */}
      {lastUpdate && (
        <div className="text-xs text-gray-500 text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default PIILeakageChartSSE;
