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

import React, { useState, useEffect, useRef } from 'react';

interface RAIStatusLight {
  category: 'Policy' | 'Privacy' | 'Fairness' | 'Robustness' | 'Oversight';
  status: 'OK' | 'Warning' | 'Risk' | 'Mitigated' | 'Pending' | 'Failed';
  message: string;
  timestamp: string;
}

interface AgentTick {
  agentName: string;
  requestId: string;
  timestamp: string;
  raiStatus: RAIStatusLight[];
  trustScore: number;
  action: string;
  duration: number;
}

interface AdversarialTest {
  id: string;
  type: 'prompt_injection' | 'bias_probe' | 'privacy_leak' | 'jailbreak';
  status: 'running' | 'blocked' | 'mitigated' | 'failed';
  description: string;
  timestamp: string;
  agentTarget: string;
}

interface TrustLayerConsoleProps {
  adversarialMode?: boolean;
  onAdversarialToggle?: (enabled: boolean) => void;
}

const TrustLayerConsole: React.FC<TrustLayerConsoleProps> = ({ 
  adversarialMode = false, 
  onAdversarialToggle 
}) => {
  const [agentTicks, setAgentTicks] = useState<AgentTick[]>([]);
  const [adversarialTests, setAdversarialTests] = useState<AdversarialTest[]>([]);
  const [isGeneratingEvidence, setIsGeneratingEvidence] = useState(false);
  const [liveDemo, setLiveDemo] = useState(false);
  const ticksRef = useRef<HTMLDivElement>(null);

  const getStatusColor = (status: string) => {
    const colors = {
      'OK': '#10b981',
      'Warning': '#f59e0b', 
      'Risk': '#ef4444',
      'Mitigated': '#3b82f6',
      'Pending': '#8b5cf6',
      'Failed': '#dc2626'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'OK': '✅',
      'Warning': '⚠️',
      'Risk': '🔴',
      'Mitigated': '🛡️',
      'Pending': '⏳',
      'Failed': '❌'
    };
    return icons[status as keyof typeof icons] || '⚪';
  };

  // Simulate live demo activity - triggered by either liveDemo or adversarialMode
  useEffect(() => {
    if (!liveDemo && !adversarialMode) return;

    const interval = setInterval(() => {
      const agents = ['announcer', 'synonymizer', 'quality_specialist', 'responsible_ai_officer'];
      const actions = ['Processing request', 'Validating input', 'Generating response', 'Safety check', 'Bias analysis'];
      
      const newTick: AgentTick = {
        agentName: agents[Math.floor(Math.random() * agents.length)],
        requestId: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        trustScore: Math.floor(Math.random() * 40) + 60, // 60-100
        action: actions[Math.floor(Math.random() * actions.length)],
        duration: Math.floor(Math.random() * 500) + 50,
        raiStatus: [
          {
            category: 'Policy',
            status: Math.random() > 0.1 ? 'OK' : 'Warning',
            message: 'Content policy compliance checked',
            timestamp: new Date().toISOString()
          },
          {
            category: 'Privacy',
            status: Math.random() > 0.05 ? 'OK' : 'Risk',
            message: 'PII detection scan completed',
            timestamp: new Date().toISOString()
          },
          {
            category: 'Fairness',
            status: Math.random() > 0.15 ? 'OK' : 'Risk',
            message: 'Bias analysis performed',
            timestamp: new Date().toISOString()
          },
          {
            category: 'Robustness',
            status: Math.random() > 0.2 ? 'OK' : 'Mitigated',
            message: 'Adversarial resistance validated',
            timestamp: new Date().toISOString()
          },
          {
            category: 'Oversight',
            status: Math.random() > 0.3 ? 'OK' : 'Pending',
            message: 'Human oversight requirements met',
            timestamp: new Date().toISOString()
          }
        ]
      };

      setAgentTicks(prev => [newTick, ...prev.slice(0, 49)]); // Keep last 50 ticks
    }, 1000 + Math.random() * 2000); // 1-3 second intervals

    return () => clearInterval(interval);
  }, [liveDemo, adversarialMode]);

  // Simulate adversarial tests
  useEffect(() => {
    if (!liveDemo && !adversarialMode) return;

    const interval = setInterval(() => {
      const testTypes = ['prompt_injection', 'bias_probe', 'privacy_leak', 'jailbreak'] as const;
      const agents = ['announcer', 'synonymizer', 'quality_specialist'];
      
      const newTest: AdversarialTest = {
        id: `test_${Date.now()}`,
        type: testTypes[Math.floor(Math.random() * testTypes.length)],
        status: Math.random() > 0.3 ? 'blocked' : Math.random() > 0.5 ? 'mitigated' : 'running',
        description: `Automated ${testTypes[Math.floor(Math.random() * testTypes.length)].replace('_', ' ')} test`,
        timestamp: new Date().toISOString(),
        agentTarget: agents[Math.floor(Math.random() * agents.length)]
      };

      setAdversarialTests(prev => [newTest, ...prev.slice(0, 19)]); // Keep last 20 tests
    }, 5000 + Math.random() * 10000); // 5-15 second intervals

    return () => clearInterval(interval);
  }, [liveDemo, adversarialMode]);

  // Auto-scroll ticks
  useEffect(() => {
    if (ticksRef.current) {
      ticksRef.current.scrollTop = 0;
    }
  }, [agentTicks]);

  // Evidence pack generation requires backend endpoint (e.g. POST /api/trust/evidence-pack).
  // Disabled until backend is implemented; no mock download.
  const EVIDENCE_PACK_AVAILABLE = false;
  const generateEvidencePack = async () => {
    if (!EVIDENCE_PACK_AVAILABLE) return;
    setIsGeneratingEvidence(true);
    try {
      const { API_BASE_URL } = await import('../../config/api');
      const res = await fetch(`${API_BASE_URL}/api/trust/evidence-pack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentTicks: agentTicks.slice(0, 10),
          adversarialTests: adversarialTests.slice(0, 5),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trust-evidence-pack-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingEvidence(false);
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--config-input-bg)' }}>
      {/* Header */}
      <div 
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ 
          backgroundColor: '#1f2937',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <h1 className="text-xl font-bold text-white">Trust Layer Console</h1>
          <div className="flex items-center gap-2 ml-4">
            <div className={`w-3 h-3 rounded-full ${(liveDemo || adversarialMode) ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-300">{(liveDemo || adversarialMode) ? 'Live Demo Active' : 'Demo Paused'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onAdversarialToggle) {
                onAdversarialToggle(!adversarialMode);
              } else {
                setLiveDemo(!liveDemo);
              }
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              (liveDemo || adversarialMode)
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {(liveDemo || adversarialMode) ? 'Stop Test' : 'Start Test'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Agent Network Console */}
        <div className="w-1/2 border-r" style={{ borderColor: 'var(--border-color)' }}>
          <div 
            className="px-4 py-3 border-b"
            style={{ 
              backgroundColor: '#374151',
              borderColor: 'var(--border-color)'
            }}
          >
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span>🔗</span>
              Agent Network Activity
            </h2>
          </div>
          
          <div className="h-full overflow-y-auto p-4" ref={ticksRef}>
            {agentTicks.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--text-color-secondary)' }}>
                <p>Start live test to see agent activity...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {agentTicks.map((tick, index) => (
                  <div 
                    key={`${tick.requestId}-${index}`}
                    className="p-3 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--config-input-bg)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: 'var(--text-color)' }}>
                          {tick.agentName}
                        </span>
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium`}
                          style={{ 
                            backgroundColor: tick.trustScore >= 80 ? '#10b98120' : tick.trustScore >= 60 ? '#f59e0b20' : '#ef444420',
                            color: tick.trustScore >= 80 ? '#10b981' : tick.trustScore >= 60 ? '#f59e0b' : '#ef4444'
                          }}
                        >
                          Trust: {tick.trustScore}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-color-secondary)' }}>
                        {new Date(tick.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-color-secondary)' }}>
                      {tick.action} ({tick.duration}ms)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Trust Layer Console */}
        <div className="w-1/2">
          <div 
            className="px-4 py-3 border-b"
            style={{ 
              backgroundColor: '#374151',
              borderColor: 'var(--border-color)'
            }}
          >
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span>🚨</span>
              RAI Status Monitor
            </h2>
          </div>
          
          <div className="h-full overflow-y-auto">
            {/* RAI Status Lights */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="font-medium mb-3" style={{ color: 'var(--text-color)' }}>
                Live RAI Status Lights
              </h3>
              {agentTicks.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {agentTicks[0].raiStatus.map((status, index) => (
                    <div 
                      key={index}
                      className="p-2 rounded-lg text-center"
                      style={{ 
                        backgroundColor: getStatusColor(status.status) + '20',
                        border: `1px solid ${getStatusColor(status.status)}`
                      }}
                    >
                      <div className="text-lg mb-1">{getStatusIcon(status.status)}</div>
                      <div className="text-xs font-medium" style={{ color: getStatusColor(status.status) }}>
                        {status.category}
                      </div>
                      <div className="text-xs" style={{ color: getStatusColor(status.status) }}>
                        {status.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Adversarial Tests */}
            <div className="p-4">
              <h3 className="font-medium mb-3" style={{ color: 'var(--text-color)' }}>
                Live Adversarial Testing
              </h3>
              {adversarialTests.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-color-secondary)' }}>
                  No adversarial tests running...
                </p>
              ) : (
                <div className="space-y-2">
                  {adversarialTests.slice(0, 8).map((test, index) => (
                    <div 
                      key={`${test.id}-${index}`}
                      className="p-2 rounded border"
                      style={{ 
                        backgroundColor: 'var(--config-input-bg)',
                        borderColor: getStatusColor(test.status === 'blocked' ? 'OK' : test.status === 'mitigated' ? 'Mitigated' : 'Warning')
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getStatusIcon(test.status === 'blocked' ? 'OK' : test.status === 'mitigated' ? 'Mitigated' : 'Warning')}</span>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                            {test.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{ 
                              backgroundColor: getStatusColor(test.status === 'blocked' ? 'OK' : test.status === 'mitigated' ? 'Mitigated' : 'Warning') + '20',
                              color: getStatusColor(test.status === 'blocked' ? 'OK' : test.status === 'mitigated' ? 'Mitigated' : 'Warning')
                            }}
                          >
                            {test.status.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-color-secondary)' }}>
                          {new Date(test.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-color-secondary)' }}>
                        Target: {test.agentTarget} | {test.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Evidence Pack Generator */}
      <div 
        className="px-6 py-4 border-t"
        style={{ 
          backgroundColor: '#1f2937',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">Audit & Compliance</span>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span>Requests Monitored: {agentTicks.length}</span>
              <span>Tests Blocked: {adversarialTests.filter(t => t.status === 'blocked').length}</span>
              <span>Avg Trust Score: {agentTicks.length > 0 ? Math.round(agentTicks.reduce((acc, t) => acc + t.trustScore, 0) / agentTicks.length) : 0}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={generateEvidencePack}
            disabled={!EVIDENCE_PACK_AVAILABLE || isGeneratingEvidence || agentTicks.length === 0}
            title={!EVIDENCE_PACK_AVAILABLE ? 'Backend endpoint (e.g. POST /api/trust/evidence-pack) required' : undefined}
            aria-label={!EVIDENCE_PACK_AVAILABLE ? 'Generate Evidence Pack (backend required)' : 'Generate Evidence Pack'}
            data-testid="trust-generate-evidence-pack"
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              !EVIDENCE_PACK_AVAILABLE || isGeneratingEvidence || agentTicks.length === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isGeneratingEvidence ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <span>📦</span>
                Generate Evidence Pack
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrustLayerConsole;
