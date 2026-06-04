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
import AIEnergyScoreCard from './cards/AIEnergyScoreCard';
import AgenticNetworkEnergyCard from './cards/AgenticNetworkEnergyCard';
import SustainabilityScoreCard from './components/SustainabilityScoreCard';

interface EnergyScoreProps {
  selectedSystemName?: string;
}

const EnergyScore: React.FC<EnergyScoreProps> = ({ selectedSystemName }) => {
  return (
    <div className="space-y-6">
      {/* Sustainability Score Card - Full Width */}
      <SustainabilityScoreCard />
      
      {/* Energy Score Cards - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIEnergyScoreCard />
        <AgenticNetworkEnergyCard networkName={selectedSystemName} />
      </div>
    </div>
  );
};

export default EnergyScore;
