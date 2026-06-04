import React from 'react';
import { BarChart3 } from 'lucide-react';

interface PerformanceMetricsProps {
  // Props for future customization
  className?: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ className = '' }) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}
      style={{ 
        backgroundColor: 'var(--config-input-bg)',
        border: '1px solid var(--border-color)'
      }}
    >
      {/* Performance Metrics Card Header */}
      <div 
        className="px-4 py-3 text-white"
        style={{ backgroundColor: 'var(--color-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-lg">⚡</span>
          <h3 className="text-lg font-semibold">Performance Metrics</h3>
        </div>
      </div>

      {/* Performance Metrics Card Content */}
      <div className="p-4 space-y-4">
        {/* Network Performance Section */}
        <div>
          <h4 
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--text-color-secondary)' }}
          >
            Agentic Network Performance
          </h4>
          <div 
            className="text-lg font-bold"
            style={{ color: 'var(--text-color)' }}
          >
            NSFlow Performance Monitor
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-green-500">✅</span>
              <span 
                className="text-sm"
                style={{ color: 'var(--text-color-secondary)' }}
              >
                Task Success Rate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-medium text-green-600 dark:text-green-400"
              >
                Excellent
              </span>
              <span 
                className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              >
                94.7%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-blue-500">⏱️</span>
              <span 
                className="text-sm"
                style={{ color: 'var(--text-color-secondary)' }}
              >
                Avg Completion Time
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                Fast
              </span>
              <span 
                className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              >
                5.05s
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span 
                className="text-sm"
                style={{ color: 'var(--text-color-secondary)' }}
              >
                Throughput
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-medium text-purple-600 dark:text-purple-400"
              >
                High
              </span>
              <span 
                className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
              >
                12.3 req/min
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-orange-500">🔧</span>
              <span 
                className="text-sm"
                style={{ color: 'var(--text-color-secondary)' }}
              >
                Tool-Call Accuracy
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-medium text-green-600 dark:text-green-400"
              >
                Precise
              </span>
              <span 
                className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              >
                98.2%
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr style={{ borderColor: 'var(--border-color)' }} />

        {/* Overall Performance Score */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 text-lg">⚡</span>
            <div className="flex-1">
              <div className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                Overall Performance Score
              </div>
              <div className="flex items-center justify-between">
                <div 
                  className="text-xs leading-relaxed text-gray-700 dark:text-gray-300"
                >
                  Network performance based on real-time execution metrics
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    9.1
                  </span>
                  <span className="text-sm text-gray-500">/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Token Efficiency Section */}
        <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-gray-600 text-lg">🎯</span>
            <div className="flex-1">
              <div className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                Token Efficiency
              </div>
              <div className="flex items-center justify-between">
                <div 
                  className="text-xs leading-relaxed text-gray-700 dark:text-gray-300"
                >
                  Average tokens per successful task: 1,424 tokens
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                    85%
                  </span>
                  <span className="text-xs text-gray-500">efficient</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Status */}
        <div className="flex items-center justify-between pt-2">
          <span 
            className="text-sm font-medium"
            style={{ color: 'var(--text-color)' }}
          >
            Performance Status
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span 
              className="text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              Monitoring Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
