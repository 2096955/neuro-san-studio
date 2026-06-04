// Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
// All Rights Reserved.
// Issued under the Academic Public License.
//
// You can be released from the terms, and requirements of the Academic Public
// License by purchasing a commercial license. Purchase of a commercial license
// is mandatory for any use of the nsflow SDK Software in commercial settings.
//
// END COPYRIGHT

import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '../layouts/PageLayout';
import EnergyScore from '../../EnergyScore';
import CostAnalysisChart from '../../charts/CostAnalysisChart';
import { useSelectedSystem } from '../../../../contexts/SelectedSystemContext';
import { neuroSanClient, type NetworkItem } from '../../../../api/neuroSanClient';

interface SustainabilityPageProps {
  adversarialMode?: boolean;
  onSectionChange?: (section: string) => void;
}

const SustainabilityPage: React.FC<SustainabilityPageProps> = ({
  adversarialMode = false,
  onSectionChange
}) => {
  const { selectedSystem } = useSelectedSystem();
  const [networks, setNetworks] = useState<NetworkItem[]>([]);
  const [activeNetwork, setActiveNetwork] = useState<string>('');
  const [networksLoading, setNetworksLoading] = useState(true);
  const [networksError, setNetworksError] = useState<string | null>(null);

  const systemNameFromContext = selectedSystem?.metadata?.system;

  const fetchNetworks = useCallback(async () => {
    setNetworksLoading(true);
    setNetworksError(null);
    try {
      const list = await neuroSanClient.listNetworks();
      setNetworks(list);
      if (list.length > 0 && !activeNetwork) {
        setActiveNetwork(list[0].name);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load networks';
      setNetworksError(message);
      setNetworks([]);
    } finally {
      setNetworksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  useEffect(() => {
    if (systemNameFromContext && networks.some((n) => n.name === systemNameFromContext)) {
      setActiveNetwork(systemNameFromContext);
    }
  }, [systemNameFromContext, networks]);

  const displayNetwork = activeNetwork || systemNameFromContext || 'NSFlow Agentic Network';

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sustainability & Cost</h2>
        <p className="text-sm text-gray-600 mt-1">
          Monitor energy consumption, environmental impact, and cost optimization for AI models and agentic networks
        </p>
      </div>

      {/* Network selector - driven by neuroSanClient */}
      <div className="mb-6">
        <label htmlFor="sustainability-network" className="block text-sm font-medium text-gray-700 mb-2">
          Agent network
        </label>
        <select
          id="sustainability-network"
          value={activeNetwork}
          onChange={(e) => setActiveNetwork(e.target.value)}
          disabled={networksLoading}
          className="block w-full max-w-xs rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        >
          {networksLoading && (
            <option value="">Loading networks…</option>
          )}
          {!networksLoading && networks.length === 0 && (
            <option value="">No networks</option>
          )}
          {networks.map((n) => (
            <option key={n.name} value={n.name}>
              {n.label || n.name}
            </option>
          ))}
        </select>
        {networksError && (
          <p className="mt-1 text-sm text-red-600">{networksError}</p>
        )}
      </div>

      {/* Energy Score Cards - network name from neuroSanClient selection */}
      <div className="mb-8">
        <EnergyScore selectedSystemName={displayNetwork} />
      </div>

      {/* Cost Analysis Chart - merged with neuroSanClient; uses activeNetwork for WebSocket */}
      <div className="mt-8">
        <CostAnalysisChart
          isRealTime={adversarialMode}
          activeNetwork={activeNetwork || 'default'}
          onClick={() => onSectionChange?.('sustainability-cost')}
          onCategoryClick={(category) => {
            console.log(`Navigate to ${category} cost details`);
          }}
        />
      </div>
    </PageLayout>
  );
};

export default SustainabilityPage;
