/**
 * Toxicity Detection Chart with SSE Integration
 * 
 * Real-time toxicity detection chart that consumes data from the backend
 * via Server-Sent Events and displays historical data based on time filters.
 */

import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { useToxicityDetectionHistory } from '../../../hooks/useGuardrailsHistory';

interface ToxicityDataPoint {
  date: string;
  detections: number;
  timestamp?: string;
}

interface ToxicityChartSSEProps {
  timeFilter?: string; // Filter from parent (5m, 15m, 1h, 24h, 7d, 30d)
  height?: number;
}

const ToxicityChartSSE: React.FC<ToxicityChartSSEProps> = ({
  timeFilter = '7d',
  height = 200
}) => {
  const [chartData, setChartData] = useState<ToxicityDataPoint[]>([]);
  const [currentFilter, setCurrentFilter] = useState(timeFilter);

  // Fetch historical data based on time filter
  const {
    data: historyData,
    isLoading: isLoadingHistory
  } = useToxicityDetectionHistory({
    timeFilter,
    autoFetch: true
  });

  // When filter changes, reset chart
  useEffect(() => {
    if (timeFilter !== currentFilter) {
      setChartData([]);
      setCurrentFilter(timeFilter);
    }
  }, [timeFilter, currentFilter]);

  // Load historical data when ready
  useEffect(() => {
    if (!isLoadingHistory && historyData && historyData.metrics) {
      // Transform metrics to chart format
      const transformedData = historyData.metrics.map((metric, index) => {
        // Format timestamp for display
        const date = new Date(metric.timestamp);
        let displayDate = '';
        
        // Show date labels at appropriate intervals based on filter
        if (timeFilter === '5m' || timeFilter === '15m' || timeFilter === '1h') {
          // Show time for short ranges
          if (index % 6 === 0) {
            displayDate = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          }
        } else if (timeFilter === '6h' || timeFilter === '24h') {
          // Show hour labels
          if (index % 12 === 0) {
            displayDate = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          }
        } else {
          // Show date labels for longer ranges
          if (index % 24 === 0) {
            displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
        }
        
        return {
          date: displayDate,
          detections: metric.detections,
          timestamp: metric.timestamp
        };
      });
      
      setChartData(transformedData);
    }
  }, [historyData, isLoadingHistory, timeFilter]);

  // Calculate statistics
  const totalDetections = chartData.reduce((sum, point) => sum + point.detections, 0);
  const avgDetections = chartData.length > 0 ? (totalDetections / chartData.length).toFixed(1) : '0.0';
  const maxDetections = chartData.length > 0 ? Math.max(...chartData.map(p => p.detections)) : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = data.timestamp ? new Date(data.timestamp) : null;
      return (
        <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
          {date && (
            <p className="text-xs text-gray-600 mb-1">
              {date.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          )}
          <p className="text-sm font-semibold text-gray-900">
            {payload[0].value} detections
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
            Input Toxicity Trigger Detections
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Avg: <span className="font-semibold text-gray-700">{avgDetections}</span></span>
          <span>Max: <span className="font-semibold text-gray-700">{maxDetections}</span></span>
          {isLoadingHistory && <span className="text-blue-600">Loading...</span>}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="toxicityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            interval="preserveStartEnd"
            tickFormatter={(value) => value || ''}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="detections"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#toxicityGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Showing data for selected time range
      </div>
    </div>
  );
};

export default ToxicityChartSSE;
