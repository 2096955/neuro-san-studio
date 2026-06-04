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

import React, { useState, useEffect } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import TrustLayerConsole from './TrustLayerConsole';
import GuardrailDashboard from './GuardrailDashboard';
import TrustScoreDetails from './TrustScoreDetails';
import RAIApp from './RAIApp';

interface RAIStatus {
  policy: 'OK' | 'Warning' | 'Risk';
  privacy: 'OK' | 'Warning' | 'Risk';
  fairness: 'OK' | 'Warning' | 'Risk';
  robustness: 'OK' | 'Warning' | 'Risk';
  oversight: 'OK' | 'Pending' | 'Risk';
}

interface RAIMonitoringOverlayProps {
  isEnabled: boolean;
  selectedNetwork: string;
  onToggle: (enabled: boolean) => void;
}

const RAIMonitoringOverlay: React.FC<RAIMonitoringOverlayProps> = ({
  isEnabled,
  selectedNetwork,
  onToggle
}) => {
  const [raiStatus, setRaiStatus] = useState<RAIStatus>({
    policy: 'OK',
    privacy: 'OK',
    fairness: 'OK',
    robustness: 'OK',
    oversight: 'OK'
  });
  
  const [trustScore, setTrustScore] = useState(87);
  const [isExpanded, setIsExpanded] = useState(false);
  const [adversarialMode, setAdversarialMode] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<string[]>([]);
  const [showGuardrailDashboard, setShowGuardrailDashboard] = useState(false);
  const [showTrustScoreDetails, setShowTrustScoreDetails] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return '#10b981';
      case 'Warning': return '#f59e0b';
      case 'Risk': return '#ef4444';
      case 'Pending': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return '✅';
      case 'Warning': return '⚠️';
      case 'Risk': return '🔴';
      case 'Pending': return '⏳';
      default: return '⚪';
    }
  };

  // Simulate RAI monitoring when enabled
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      // Simulate status changes
      setRaiStatus(prev => ({
        policy: Math.random() > 0.1 ? 'OK' : 'Warning',
        privacy: Math.random() > 0.05 ? 'OK' : 'Risk',
        fairness: Math.random() > 0.15 ? 'OK' : Math.random() > 0.5 ? 'Warning' : 'Risk',
        robustness: adversarialMode && Math.random() > 0.3 ? 'Warning' : 'OK',
        oversight: Math.random() > 0.2 ? 'OK' : 'Pending'
      }));

      // Update trust score
      setTrustScore(prev => Math.max(60, Math.min(100, prev + (Math.random() - 0.5) * 5)));

      // Add alerts occasionally
      if (Math.random() > 0.8) {
        const alerts = [
          'Bias probe detected and mitigated',
          'Privacy scan completed',
          'Adversarial input blocked',
          'Policy compliance verified'
        ];
        setRecentAlerts(prev => [
          alerts[Math.floor(Math.random() * alerts.length)],
          ...prev.slice(0, 2)
        ]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isEnabled, adversarialMode]);

  if (!isEnabled) {
    return (
      <button
        onClick={() => onToggle(true)}
        className="header-btn h-10 px-6 py-2 flex items-center gap-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 border-transparent"
        title="Enable Responsible AI Monitoring"
        style={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}
      >
        <FaShieldAlt className="text-lg" />
        <span>Enable Cognizant Trust™</span>
        <div className="w-2 h-2 bg-white rounded-full animate-pulse opacity-80"></div>
      </button>
    );
  }

  return (
    <>
      <style>{`
        @keyframes heart-pulse {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-96px); }
        }
        @keyframes scan-line {
          0% { transform: translateX(0px); opacity: 1; }
          50% { opacity: 0.3; }
          100% { transform: translateX(96px); opacity: 1; }
        }
        .heart-monitor-container path {
          opacity: 0.9;
        }
        .heart-monitor-container path:hover {
          opacity: 1;
          stroke-width: 3;
        }
      `}</style>
      {/* Top Status Bar - Fixed positioning restored */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 px-6 py-1 border-b-2 shadow-lg backdrop-blur-sm rounded-b-xl"
        style={{ 
          background: 'linear-gradient(135deg, rgba(237, 233, 254, 0.85) 0%, rgba(221, 214, 254, 0.85) 100%)',
          borderColor: '#e5e7eb',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <FaShieldAlt className="text-2xl text-purple-600" />
                <span className="text-gray-700 font-bold text-lg">
                  RAI Monitor
                </span>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div className="text-gray-700 font-semibold bg-white bg-opacity-30 px-3 py-1 rounded-lg">
                {selectedNetwork}
              </div>
            </div>
            
            {/* RAI Heart Rate Monitor Visual */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  {/* Heart rate monitor style chart */}
                  <div className="w-24 h-8 relative overflow-hidden bg-gray-800 rounded border border-green-400">
                    <svg width="96" height="32" className="absolute">
                      {/* Background with grid */}
                      <rect width="96" height="32" fill="#374151" />
                      <defs>
                        <pattern id="heartGrid" width="4" height="4" patternUnits="userSpaceOnUse">
                          <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#10b981" strokeWidth="0.3" opacity="0.3"/>
                        </pattern>
                      </defs>
                      <rect width="96" height="32" fill="url(#heartGrid)" />
                      
                      {/* Heart rate pulse lines */}
                      <g className="heart-monitor-container">
                        {/* Main RAI pulse - Green */}
                        <path
                          d="M0,16 L8,16 L12,8 L16,24 L20,4 L24,28 L28,16 L36,16 L40,12 L44,20 L48,8 L52,24 L56,16 L64,16 L68,10 L72,22 L76,6 L80,26 L84,16 L96,16"
                          stroke="#10b981"
                          strokeWidth="2"
                          fill="none"
                          style={{
                            animation: 'heart-pulse 2s linear infinite',
                            filter: 'drop-shadow(0 0 4px #10b981)'
                          }}
                        />
                        {/* Secondary pulse - Cyan */}
                        <path
                          d="M0,20 L6,20 L10,14 L14,26 L18,12 L22,24 L26,20 L32,20 L36,16 L40,24 L44,14 L48,22 L52,20 L58,20 L62,18 L66,22 L70,16 L74,24 L78,20 L84,20 L88,18 L92,22 L96,20"
                          stroke="#06b6d4"
                          strokeWidth="1.5"
                          fill="none"
                          style={{
                            animation: 'heart-pulse 2.3s linear infinite',
                            filter: 'drop-shadow(0 0 3px #06b6d4)',
                            opacity: 0.8
                          }}
                        />
                        {/* Tertiary pulse - Yellow */}
                        <path
                          d="M0,12 L4,12 L8,8 L12,16 L16,6 L20,18 L24,12 L28,12 L32,10 L36,14 L40,8 L44,16 L48,12 L52,12 L56,11 L60,13 L64,9 L68,15 L72,12 L76,12 L80,11 L84,13 L88,10 L92,14 L96,12"
                          stroke="#eab308"
                          strokeWidth="1"
                          fill="none"
                          style={{
                            animation: 'heart-pulse 1.8s linear infinite',
                            filter: 'drop-shadow(0 0 2px #eab308)',
                            opacity: 0.6
                          }}
                        />
                      </g>
                      
                      {/* Scanning line */}
                      <line
                        x1="0" y1="0" x2="0" y2="32"
                        stroke="#10b981"
                        strokeWidth="1"
                        opacity="0.8"
                        style={{
                          animation: 'scan-line 3s linear infinite'
                        }}
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 text-xs font-mono font-bold">RAI</span>
                    <span className="text-gray-600 text-xs font-mono">LIVE</span>
                    <span className="text-gray-700 text-xs font-mono font-bold">
                      Trust {Math.round(trustScore)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-4">

            {/* Enhanced Controls */}
            <button
              onClick={() => setShowDashboard(true)}
              className="px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 flex items-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 shadow-lg border-2 border-purple-300"
            >
              <FaShieldAlt className="mr-2" />
              Cognizant Trust™
            </button>

            <button
              onClick={() => onToggle(false)}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-gray-700 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 border-2 border-gray-300 shadow-lg"
            >
              Disable
            </button>
          </div>
        </div>
      </div>

      {/* Trust Layer Console Modal */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsExpanded(false)}
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
                onClick={() => setIsExpanded(false)}
                className="absolute top-1 right-2 w-6 h-6 flex items-center justify-center text-white text-lg font-bold bg-transparent border-none outline-none hover:opacity-80"
                style={{ backgroundColor: 'transparent' }}
              >
                ×
              </button>
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-lg">⚔️</span>
                <h2 className="text-lg font-semibold">Red Team Console - {selectedNetwork}</h2>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              <div className="mb-6">
                <TrustLayerConsole 
                  adversarialMode={adversarialMode}
                  onAdversarialToggle={setAdversarialMode}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guardrail Dashboard Modal */}
      <GuardrailDashboard 
        isOpen={showGuardrailDashboard}
        onClose={() => setShowGuardrailDashboard(false)}
        selectedNetwork={selectedNetwork}
      />

      {/* Trust Score Details Modal */}
      {showTrustScoreDetails && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTrustScoreDetails(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
                onClick={() => setShowTrustScoreDetails(false)}
                className="absolute top-1 right-2 w-6 h-6 flex items-center justify-center text-white text-lg font-bold bg-transparent border-none outline-none hover:opacity-80"
                style={{ backgroundColor: 'transparent' }}
              >
                ×
              </button>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-lg">🛡️</span>
                <h2 className="text-lg font-semibold">Trust Score Details - {selectedNetwork}</h2>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              <TrustScoreDetails 
                agentName="announcer"
                trustScore={Math.round(trustScore)}
              />
            </div>
          </div>
        </div>
      )}

      {/* RAI Analytics Dashboard Modal */}
      <RAIApp
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
        selectedNetwork={selectedNetwork}
        trustScore={trustScore}
        adversarialMode={adversarialMode}
        onAdversarialToggle={setAdversarialMode}
      />

      {/* Floating Alerts */}
      {recentAlerts.length > 0 && !isExpanded && (
        <div className="fixed bottom-4 right-4 z-50">
          <div 
            className="p-3 rounded-lg shadow-lg max-w-xs"
            style={{ 
              backgroundColor: '#10b981',
              color: 'white'
            }}
          >
            <div className="text-sm font-medium">Latest RAI Alert</div>
            <div className="text-xs mt-1">{recentAlerts[0]}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default RAIMonitoringOverlay;
