import React from 'react';

const AISafety = () => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      style={{ 
        backgroundColor: 'var(--config-input-bg)',
        border: '1px solid var(--border-color)'
      }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 text-white"
        style={{ backgroundColor: 'var(--color-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-lg">🛡️</span>
          <h3 className="text-lg font-semibold">AI Safety Score</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Monitoring Section */}
        <div>
          <h4 
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--text-color-secondary)' }}
          >
            Agentic Network Monitoring
          </h4>
          <div 
            className="text-lg font-bold"
            style={{ color: 'var(--text-color)' }}
          >
            Safety Monitor
          </div>
        </div>

        {/* Safety Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-500">⚖️</span>
              <span 
                className="text-sm"
                style={{ color: 'var(--text-color-secondary)' }}
              >
                Bias Detection
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xs font-medium">Low Risk</span>
              <span 
                className="text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded"
              >
                0.12
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">🔒</span>
              <span 
                className="text-sm"
                style={{ color: 'var(--text-color-secondary)' }}
              >
                PII Leakage Detection
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-xs font-medium">Secure</span>
              <span 
                className="text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
              >
                0.03
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">🧠</span>
              <span 
                className="text-sm"
                style={{ color: 'var(--text-color-secondary)' }}
              >
                Hallucination Risk
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-600 text-xs font-medium">Medium</span>
              <span 
                className="text-sm font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded"
              >
                0.34
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-500">⚠️</span>
              <span 
                className="text-sm"
                style={{ color: 'var(--text-color-secondary)' }}
              >
                Content Safety
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xs font-medium">Safe</span>
              <span 
                className="text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded"
              >
                0.08
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr style={{ borderColor: 'var(--border-color)' }} />

        {/* Overall Safety Score */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-red-600 text-lg">🛡️</span>
            <div className="flex-1">
              <div className="text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">
                Overall Safety Score
              </div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--text-color-secondary)' }}>
                Agentic Network safety assessment based on real-time monitoring
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">8.7</span>
                <span className="text-sm" style={{ color: 'var(--text-color-secondary)' }}>/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Status */}
        <div className="flex items-center justify-between pt-2">
          <span 
            className="text-sm font-medium"
            style={{ color: 'var(--text-color)' }}
          >
            Safety Status
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span 
              className="text-sm font-medium text-green-600 dark:text-green-400"
            >
              Monitoring Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISafety;
