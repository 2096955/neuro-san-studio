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
import Sidebar, { type DashboardSection } from './dashboard/Sidebar';
import RAIRouter from './routes/RAIRouter';

interface RAIAppProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNetwork: string;
  trustScore: number;
  adversarialMode: boolean;
  onAdversarialToggle: (enabled: boolean) => void;
}


const RAIApp: React.FC<RAIAppProps> = ({
  isOpen,
  onClose,
  selectedNetwork,
  trustScore,
  adversarialMode,
  onAdversarialToggle
}) => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');

  if (!isOpen) return null;

  // Section title mapping for cleaner code
  const sectionTitles: Record<DashboardSection, string> = {
    'overview': 'Overview',
    'trust-framework': 'Trust Framework',
    'ai-registry': 'AI Registry',
    'agentic-systems': 'Agentic Systems',
    'dashboard': 'Live Dashboard (Guardrails)',
    'guardrails-section': 'Guardrails',
    'trust-analytics': 'Red Teaming / Test Runs',
    'performance-reliability': 'Performance & Reliability',
    'guardrails': 'AI Safety & Ethics',
    'sustainability-cost': 'Sustainability & Cost',
    'performance': 'Governance & Compliance',
    'policies': 'Policies',
    'create-policy': 'Create Policy',
    'create-guardrail': 'Create Guardrail'
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="rounded-lg shadow-xl w-full max-w-[98vw] h-[98vh] flex overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          backgroundColor: 'var(--config-input-bg)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-xl font-bold hover:opacity-80 transition-opacity rounded-full"
          style={{ 
            backgroundColor: 'var(--config-input-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
          }}
          title="Close Dashboard"
        >
          ×
        </button>
        {/* Sidebar */}
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          selectedNetwork={selectedNetwork}
          onClose={onClose}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Header */}
          <div 
            className="px-6 py-4 flex-shrink-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold" style={{ color: 'var(--text-color)' }}>
                  {sectionTitles[activeSection] || 'Dashboard'}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Network: {selectedNetwork}
                </p>
              </div>
            </div>
          </div>

          {/* Content Area with Router */}
          <div className="flex-1 overflow-y-auto">
            <RAIRouter
              activeSection={activeSection}
              selectedNetwork={selectedNetwork}
              trustScore={trustScore}
              adversarialMode={adversarialMode}
              onAdversarialToggle={onAdversarialToggle}
              onSectionChange={setActiveSection}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RAIApp;
