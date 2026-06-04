/**
 * 🎯 Example Chart using Event-Driven Chart Subscription Pattern
 * 
 * Shows how to implement the SSE pattern in any chart component.
 * Just change the eventType to match your chart's data type.
 */

import React, { useState, useCallback } from 'react';
import { useSSEChart } from '../../../hooks/useSSEChart';

interface BiasData {
  bias_score: number;
  demographic_group: string;
  model_name: string;
  is_biased: boolean;
  confidence: number;
}

export const BiasDetectionChartSSE: React.FC = () => {
  const [biasData, setBiasData] = useState<BiasData | null>(null);

  // Stable callback to prevent infinite re-renders
  const handleBiasData = useCallback((newData: BiasData) => {
    setBiasData(newData);
    // console.log('📊 Bias chart updated:', newData);
  }, []);

  // 🎯 Event-Driven Chart Subscription Pattern
  const { isConnected, error, lastUpdate } = useSSEChart({
    eventType: 'bias_detection',
    onData: handleBiasData
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bias Detection</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-600">Connection Error: {error}</p>
        </div>
      )}

      {biasData ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Model</p>
              <p className="font-medium">{biasData.model_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Group</p>
              <p className="font-medium">{biasData.demographic_group}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bias Score</span>
              <span className={`text-lg font-bold ${biasData.is_biased ? 'text-red-600' : 'text-green-600'}`}>
                {(biasData.bias_score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${biasData.is_biased ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${biasData.bias_score * 100}%` }}
              />
            </div>
          </div>

          {lastUpdate && (
            <p className="text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500">Waiting for data...</p>
        </div>
      )}
    </div>
  );
};
