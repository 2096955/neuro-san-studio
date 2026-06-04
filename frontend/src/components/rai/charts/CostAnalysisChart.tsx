import React, { useState, useEffect } from 'react';
import { getWebSocketUrl } from '../../../config/api';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Use number type for browser setTimeout/clearTimeout

interface TokenAccountingData {
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  successful_requests: number;
  total_cost: number;
  time_taken_in_seconds: number;
  models?: {
    [provider: string]: {
      [model: string]: {
        total_tokens: number;
        prompt_tokens: number;
        completion_tokens: number;
        successful_requests: number;
        total_cost: number;
        time_taken_in_seconds: number;
      };
    };
  };
}

interface CostMetric {
  timestamp: string;
  totalCost: number;
  promptCost: number;
  completionCost: number;
  infraCost: number;
  energyCost: number;
}

interface CostBreakdown {
  category: string;
  cost: number;
  percentage: number;
  color: string;
  [key: string]: any; // Add index signature for Recharts compatibility
}

interface CostAnalysisChartProps {
  isRealTime?: boolean;
  size?: number;
  tokenAccountingData?: TokenAccountingData;
  onClick?: () => void;
  onCategoryClick?: (category: string) => void;
  wsUrl?: string;
  activeNetwork?: string;
}

const CostAnalysisChart: React.FC<CostAnalysisChartProps> = ({
  isRealTime = false,
  tokenAccountingData,
  onClick,
  onCategoryClick,
  wsUrl,
  activeNetwork = 'default'
}) => {
  const resolvedWsUrl = wsUrl ?? getWebSocketUrl(`/api/v1/ws/sustainability/${activeNetwork}`);
  const [costHistory, setCostHistory] = useState<CostMetric[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [totalDailyCost, setTotalDailyCost] = useState(0);
  const [costPerToken, setCostPerToken] = useState(0);
  const [costPerMinute, setCostPerMinute] = useState(0);
  const [costTrend, setCostTrend] = useState(0);
  const [liveTokenData, setLiveTokenData] = useState<TokenAccountingData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Generate historical cost data for the past hour
  const generateHistoricalData = (currentData: TokenAccountingData, count: number = 100): CostMetric[] => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    const timeInterval = (60 * 60 * 1000) / count; // Time between each data point
    
    const historicalData: CostMetric[] = [];
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(oneHourAgo.getTime() + (i * timeInterval));
      const timeString = timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      });
      
      // Add some variation to make the data realistic
      const variation = 0.8 + (Math.random() * 0.4); // Random between 0.8 and 1.2
      const costs = calculateCostsFromTokenData({
        ...currentData,
        total_cost: currentData.total_cost * variation
      });
      
      historicalData.push({
        timestamp: timeString,
        totalCost: costs.totalCost,
        promptCost: costs.promptCost,
        completionCost: costs.completionCost,
        infraCost: costs.infraCost,
        energyCost: costs.energyCost
      });
    }
    
    return historicalData;
  };

  // Calculate costs from token accounting data
  const calculateCostsFromTokenData = (data: TokenAccountingData) => {
    // Calculate actual prompt/completion cost ratio based on token counts
    const totalTokens = data.total_tokens;
    const promptRatio = totalTokens > 0 ? data.prompt_tokens / totalTokens : 0.6;
    const completionRatio = totalTokens > 0 ? data.completion_tokens / totalTokens : 0.4;
    
    const promptCost = data.total_cost * promptRatio;
    const completionCost = data.total_cost * completionRatio;
    
    // Calculate infrastructure and energy costs based on realistic values
    // API Cost: $0.0205 (91.5%), Infra: $0.0014 (6.5%), Energy: $0.00045 (2%)
    const infraCost = 0.0014; // Fixed infra cost per request
    const energyCost = 0.00045; // Fixed energy cost per request (0.0003 kWh × $0.13/kWh + overheads)
    
    return {
      promptCost,
      completionCost,
      infraCost,
      energyCost,
      totalCost: data.total_cost + infraCost + energyCost
    };
  };

  // WebSocket connection for real-time token accounting data
  useEffect(() => {
    if (!isRealTime) return;

    setConnectionStatus('connecting');
    let ws: WebSocket | null = null;
    let isCleanedUp = false;
    let reconnectTimeout: number;

    const connectWebSocket = () => {
      if (isCleanedUp) return;

      try {
        // Connect to the sustainability WebSocket endpoint using dynamic URL
        const websocketUrl = resolvedWsUrl;
        console.log('Attempting to connect to WebSocket:', websocketUrl);
        ws = new WebSocket(websocketUrl);

        ws.onopen = () => {
          if (!isCleanedUp) {
            setConnectionStatus('connected');
            console.log('Cost Analysis WebSocket connected');
          }
        };

        ws.onmessage = (event) => {
          if (isCleanedUp) return;
          
          try {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket data:', data);
            
            // Handle both old format (direct sustainability metrics) and new format (with token_accounting)
            if (data.token_accounting) {
              console.log('Found token_accounting in WebSocket data:', data.token_accounting);
              setLiveTokenData(data.token_accounting);
            } else if (data.sustainability_metrics && data.sustainability_metrics.token_accounting) {
              console.log('Found token_accounting in sustainability_metrics:', data.sustainability_metrics.token_accounting);
              setLiveTokenData(data.sustainability_metrics.token_accounting);
            } else {
              console.log('No token_accounting found in WebSocket data, full message:', data);
              // Force update with latest data if available
              if (tokenAccountingData) {
                console.log('Using fallback tokenAccountingData');
                setLiveTokenData(tokenAccountingData);
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          if (!isCleanedUp) {
            setConnectionStatus('disconnected');
            console.log('Cost Analysis WebSocket disconnected - attempting reconnect in 3s');
            reconnectTimeout = setTimeout(() => {
              if (!isCleanedUp) {
                connectWebSocket();
              }
            }, 3000);
          }
        };

        ws.onerror = (error) => {
          console.error('Cost Analysis WebSocket error:', error);
          if (!isCleanedUp) {
            setConnectionStatus('disconnected');
          }
        };

      } catch (error) {
        console.error('Failed to connect Cost Analysis WebSocket:', error);
        if (!isCleanedUp) {
          setConnectionStatus('disconnected');
        }
      }
    };

    connectWebSocket();

    return () => {
      isCleanedUp = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [isRealTime]);

  // Initialize with dummy data if no real data is available
  useEffect(() => {
    // Dummy data for when WebSocket is not available
    const dummyTokenData: TokenAccountingData = {
      total_tokens: 1250,
      prompt_tokens: 800,
      completion_tokens: 450,
      successful_requests: 15,
      total_cost: 0.0045,
      time_taken_in_seconds: 2.3
    };

    const currentData = liveTokenData || tokenAccountingData || dummyTokenData;
    if (!currentData) return;

    // Generate 100 historical data points for the past hour
    const historicalData = generateHistoricalData(currentData, 100);
    setCostHistory(historicalData);

    // Calculate costs for current data
    const costs = calculateCostsFromTokenData(currentData);

    // Update cost breakdown
    setCostBreakdown([
      {
        category: 'API Costs',
        cost: currentData.total_cost,
        percentage: (currentData.total_cost / costs.totalCost) * 100,
        color: '#3b82f6'
      },
      {
        category: 'Infrastructure',
        cost: costs.infraCost,
        percentage: (costs.infraCost / costs.totalCost) * 100,
        color: '#10b981'
      },
      {
        category: 'Energy',
        cost: costs.energyCost,
        percentage: (costs.energyCost / costs.totalCost) * 100,
        color: '#f59e0b'
      }
    ]);

    // Update key metrics
    const dailyRequestCount = 300; // Number of requests per day
    setTotalDailyCost(costs.totalCost * dailyRequestCount); // Multiply by daily request count
    setCostPerToken(currentData.total_tokens > 0 ? costs.totalCost / currentData.total_tokens : 0);
    setCostPerMinute(currentData.time_taken_in_seconds > 0 ? (costs.totalCost / currentData.time_taken_in_seconds) * 60 : 0);
    
    // Calculate trend using current history length
    if (costHistory.length >= 1) {
      const current = costs.totalCost;
      const previous = costHistory[costHistory.length - 1].totalCost;
      const trend = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      setCostTrend(trend);
    }
  }, []); // Run only once on mount

  // Real-time simulation for demo
  useEffect(() => {
    if (!isRealTime) return;

    // Use dummy data if no real data is available
    const baseData = tokenAccountingData || {
      total_tokens: 1250,
      prompt_tokens: 800,
      completion_tokens: 450,
      successful_requests: 15,
      total_cost: 0.0045,
      time_taken_in_seconds: 2.3
    };

    const interval = setInterval(() => {
      // Simulate small cost variations
      const variation = (Math.random() - 0.5) * 0.0001;
      const simulatedData = {
        ...baseData,
        total_cost: Math.max(0, baseData.total_cost + variation)
      };
      
      const costs = calculateCostsFromTokenData(simulatedData);
      const timestamp = new Date().toLocaleTimeString();

      setCostHistory(prev => {
        const newEntry: CostMetric = {
          timestamp,
          totalCost: costs.totalCost,
          promptCost: costs.promptCost,
          completionCost: costs.completionCost,
          infraCost: costs.infraCost,
          energyCost: costs.energyCost
        };
        const updated = [...prev, newEntry];
        return updated.slice(-20);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isRealTime]);

  const formatCurrency = (value: number) => {
    // Always show actual value without 'k' notation for clarity
    if (value < 0.01) return `$${value.toFixed(5)}`;
    return `$${value.toFixed(4)}`;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-red-600';
    if (trend < -5) return 'text-green-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return '↗️';
    if (trend < -5) return '↘️';
    return '→';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Cost Analysis</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${getTrendColor(costTrend)}`}>
            {getTrendIcon(costTrend)} {Math.abs(costTrend).toFixed(1)}%
          </span>
          {isRealTime && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-500">
                {connectionStatus === 'connected' ? 'Live' : 
                 connectionStatus === 'connecting' ? 'Connecting' : 
                 'Disconnected'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-xs text-blue-600 font-medium">Daily Total</div>
          <div className="text-lg font-bold text-blue-800">{formatCurrency(totalDailyCost)}</div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-xs text-green-600 font-medium">Per 1k Tokens</div>
          <div className="text-lg font-bold text-green-800">{formatCurrency(costPerToken * 1000)}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <div className="text-xs text-purple-600 font-medium">Per Minute</div>
          <div className="text-lg font-bold text-purple-800">{formatCurrency(costPerMinute)}</div>
        </div>
        <div className="bg-orange-50 p-3 rounded">
          <div className="text-xs text-orange-600 font-medium">Last Request</div>
          <div className="text-lg font-bold text-orange-800">
            {tokenAccountingData ? formatCurrency(tokenAccountingData.total_cost) : '$0.000'}
          </div>
        </div>
      </div>

      {/* Cost Trend Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Cost Trend</h4>
        <div style={{ width: '100%', height: 120 }}>
          <ResponsiveContainer>
            <AreaChart data={costHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Cost']}
                labelStyle={{ fontSize: '12px' }}
                contentStyle={{ fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="totalCost" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Cost Breakdown (per request)</h4>
        <div className="flex justify-between items-center">
          <div style={{ width: 120, height: 120 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  dataKey="cost"
                  onClick={(entry) => onCategoryClick?.(entry.category)}
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 ml-4 space-y-2">
            {costBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(item.cost)}</div>
                  <div className="text-gray-500">{item.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Token Usage Details */}
      {(liveTokenData || tokenAccountingData) && (
        <div className="pt-4 border-t border-gray-100">
          {/* <h5 className="text-sm font-semibold text-gray-700 mb-2">Latest Request Details</h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Total Tokens:</span>
              <span className="ml-1 font-medium">{(liveTokenData || tokenAccountingData)!.total_tokens.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Duration:</span>
              <span className="ml-1 font-medium">{(liveTokenData || tokenAccountingData)!.time_taken_in_seconds.toFixed(2)}s</span>
            </div>
            <div>
              <span className="text-gray-500">Prompt Tokens:</span>
              <span className="ml-1 font-medium">{(liveTokenData || tokenAccountingData)!.prompt_tokens.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Completion:</span>
              <span className="ml-1 font-medium">{(liveTokenData || tokenAccountingData)!.completion_tokens.toLocaleString()}</span>
            </div>
          </div> */}
          
          {(liveTokenData || tokenAccountingData)!.models && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Models Used:</span>
              <div className="text-xs text-gray-700 mt-1">
                {Object.entries((liveTokenData || tokenAccountingData)!.models!).map(([provider, models]) =>
                  Object.keys(models).map(model => (
                    <span key={`${provider}-${model}`} className="inline-block bg-gray-100 px-2 py-1 rounded mr-1 mb-1">
                      {model}
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CostAnalysisChart;
