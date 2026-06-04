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

interface AgenticNetworkEnergyCardProps {
  networkName?: string;
  totalEnergy?: string;
  totalEnergyNote?: string;
  lastHourEnergy?: string;
  lastHourNote?: string;
  energyCost?: string;
  energyCostNote?: string;
  comparisonText?: string;
  comparisonDays?: string;
  isActive?: boolean;
}

const AgenticNetworkEnergyCard: React.FC<AgenticNetworkEnergyCardProps> = ({
  networkName = 'NSFlow Agentic Network',
  totalEnergy = '≈ 12 – 14 kWh',
  totalEnergyNote = '~6 h active at 2 – 2.3 kWh/h',
  lastHourEnergy = '≈ 2.2 kWh',
  lastHourNote = 'matches current load',
  energyCost = '≈ $1.50 – $1.80',
  energyCostNote = 'assuming $0.12 – $0.14 / kWh Azure blended',
  comparisonText = '13 kWh',
  comparisonDays = '9 days',
  isActive = true
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
    >
      {/* Card Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Agentic Network Energy Score</h3>
        <p className="text-sm text-gray-600">Real-time network energy consumption and cost tracking</p>
      </div>

      {/* Card Content */}
      <div className="space-y-4">
        {/* Network Name Section */}
        <div className="pb-3">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Network
          </h4>
          <div className="text-lg font-bold text-gray-900">
            {networkName}
          </div>
        </div>

        {/* Energy Metrics */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600">
                Total Energy
              </span>
              <span className="text-base font-bold text-gray-900">
                {totalEnergy}
              </span>
            </div>
            <div className="text-xs text-gray-500 italic text-right">
              {totalEnergyNote}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600">
                Last Hour
              </span>
              <span className="text-base font-bold text-gray-900">
                {lastHourEnergy}
              </span>
            </div>
            <div className="text-xs text-gray-500 italic text-right">
              {lastHourNote}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600">
                Energy Cost
              </span>
              <span className="text-base font-bold text-gray-900">
                {energyCost}
              </span>
            </div>
            <div className="text-xs text-gray-500 italic text-right">
              {energyCostNote}
            </div>
          </div>
        </div>

        {/* Energy Comparison */}
        <div className="p-4 rounded-lg bg-gray-50">
          <div className="text-sm font-semibold mb-2 text-gray-800">
            Energy Comparison
          </div>
          <div className="text-xs leading-relaxed text-gray-600">
            <span className="font-bold text-gray-900">{comparisonText}</span> ≈ running a 60W light bulb for <span className="font-semibold">{comparisonDays}</span> continuously
          </div>
        </div>

        {/* Network Status */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-gray-800">
            Network Status
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg">🟢</span>
            <span className={`text-sm font-bold ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticNetworkEnergyCard;
