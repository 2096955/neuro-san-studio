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
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line,
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

interface PIILeakageChartProps {
  mode?: 'donut' | 'timeseries' | 'heatmap';
  data?: PIICategory[];
  timeSeriesData?: TimeSeriesData[];
  isRealTime?: boolean;
  onModeChange?: (mode: string) => void;
}

const PIILeakageChart: React.FC<PIILeakageChartProps> = ({
  mode = 'donut',
  data,
  timeSeriesData,
  isRealTime = false,
  onModeChange
}) => {
  const [activeMode, setActiveMode] = useState(mode);

  // Default PII categories data
  const defaultPIIData: PIICategory[] = data || [
    { name: 'Email Addresses', detected: 45, blocked: 42, leaked: 3, severity: 'medium' },
    { name: 'Phone Numbers', detected: 28, blocked: 28, leaked: 0, severity: 'low' },
    { name: 'SSN/Tax IDs', detected: 12, blocked: 11, leaked: 1, severity: 'high' },
    { name: 'Credit Cards', detected: 8, blocked: 8, leaked: 0, severity: 'low' },
    { name: 'Home Addresses', detected: 35, blocked: 33, leaked: 2, severity: 'medium' },
    { name: 'Full Names', detected: 67, blocked: 65, leaked: 2, severity: 'medium' },
    { name: 'Medical IDs', detected: 5, blocked: 5, leaked: 0, severity: 'low' },
    { name: 'Bank Account', detected: 3, blocked: 3, leaked: 0, severity: 'low' }
  ];

  // Default time series data
  const defaultTimeSeriesData: TimeSeriesData[] = timeSeriesData || [
    { timestamp: '09:00', email: 8, phone: 5, ssn: 2, creditCard: 1, address: 6, total: 22 },
    { timestamp: '09:15', email: 12, phone: 3, ssn: 1, creditCard: 0, address: 8, total: 24 },
    { timestamp: '09:30', email: 6, phone: 7, ssn: 0, creditCard: 2, address: 4, total: 19 },
    { timestamp: '09:45', email: 15, phone: 4, ssn: 3, creditCard: 1, address: 9, total: 32 },
    { timestamp: '10:00', email: 9, phone: 6, ssn: 1, creditCard: 0, address: 5, total: 21 },
    { timestamp: '10:15', email: 11, phone: 2, ssn: 0, creditCard: 1, address: 7, total: 21 }
  ];

  const handleModeChange = (newMode: string) => {
    setActiveMode(newMode as any);
    onModeChange?.(newMode);
  };

  // Prepare donut chart data
  const donutData = defaultPIIData.map(item => ({
    name: item.name,
    value: item.leaked,
    detected: item.detected,
    blocked: item.blocked,
    severity: item.severity
  }));

  const getSeverityColor = (severity: string, opacity = 1) => {
    switch (severity) {
      case 'high': return `rgba(239, 68, 68, ${opacity})`;
      case 'medium': return `rgba(245, 158, 11, ${opacity})`;
      default: return `rgba(34, 197, 94, ${opacity})`;
    }
  };

  const getTotalLeaked = () => defaultPIIData.reduce((sum, item) => sum + item.leaked, 0);
  const getTotalDetected = () => defaultPIIData.reduce((sum, item) => sum + item.detected, 0);
  const getTotalBlocked = () => defaultPIIData.reduce((sum, item) => sum + item.blocked, 0);

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
                      formatter={(value: any, name: any, props: any) => [
                        `${value} leaked`,
                        `${props.payload.detected} detected, ${props.payload.blocked} blocked`
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center metrics */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{getTotalLeaked()}</div>
                    <div className="text-xs text-gray-600">Total Leaked</div>
                  </div>
                </div>
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
                      style={{ width: `${((getTotalBlocked() / getTotalDetected()) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {Math.round((getTotalBlocked() / getTotalDetected()) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Details */}
      <div className="grid grid-cols-2 gap-3">
        {defaultPIIData.map((category) => (
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
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={defaultTimeSeriesData}>
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
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock size={20} className="text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">PII Leakage Detection</h3>
          {isRealTime && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              <Activity size={12} />
              Live
            </div>
          )}
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

      {/* Chart Content */}
      <div className="bg-white rounded-lg p-4">
        {activeMode === 'donut' && renderDonutChart()}
        {activeMode === 'timeseries' && renderTimeSeriesChart()}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-green-50 rounded-xl border border-green-200"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="text-green-800 font-bold text-sm">SECURE</div>
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
              <div className="text-yellow-800 font-bold text-sm">DETECTED</div>
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
              <div className="text-red-800 font-bold text-sm">LEAKED</div>
            </div>
            <div className="text-red-600 text-xs font-medium">1 category</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PIILeakageChart;
