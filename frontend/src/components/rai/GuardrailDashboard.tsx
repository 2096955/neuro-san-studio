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

import React from 'react';
import AISafety from './AISafety';
import PerformanceMetrics from './PerformanceMetrics';

interface GuardrailDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNetwork?: string;
}

const GuardrailDashboard: React.FC<GuardrailDashboardProps> = ({
  isOpen,
  onClose,
  selectedNetwork = 'Unknown Network'
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          backgroundColor: 'var(--config-input-bg)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 text-white relative flex-shrink-0"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        >
          <button
            onClick={onClose}
            className="absolute top-1 right-2 w-6 h-6 flex items-center justify-center text-white text-lg font-bold bg-transparent border-none outline-none hover:opacity-80"
            style={{ backgroundColor: 'transparent' }}
          >
            ×
          </button>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">🛡️</span>
            <h2 className="text-lg font-semibold">Guardrails Dashboard - {selectedNetwork}</h2>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Safety Component */}
            <div className="space-y-4">
              <AISafety />
            </div>
            
            {/* Performance Metrics Component */}
            <div className="space-y-4">
              <PerformanceMetrics />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardrailDashboard;
