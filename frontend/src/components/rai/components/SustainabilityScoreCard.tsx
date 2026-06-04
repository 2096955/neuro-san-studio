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
import { Water, Nature, Bolt, AttachMoney } from '@mui/icons-material';

interface SustainabilityScoreCardProps {
  energyKwh?: number;
  energyDescription?: string;
  co2Grams?: number;
  co2Description?: string;
  waterLiters?: string;
  waterDescription?: string;
  cost?: number;
  costDescription?: string;
}

const SustainabilityScoreCard: React.FC<SustainabilityScoreCardProps> = ({
  energyKwh = 0.0003,
  energyDescription = "Average end-to-end inference energy for a GPT-4o API call executed via Azure H100 infrastructure. Includes Azure datacenter compute and network overhead per model request.",
  co2Grams = 0.066,
  co2Description = "Estimated carbon footprint using Azure's global average carbon intensity of ≈ 0.22 kg CO₂ / kWh. Reflects the cloud region mix serving GPT-4o API traffic.",
  waterLiters = "0.0003 – 0.0005",
  waterDescription = "Water usage from cooling and power generation for cloud inference. Based on Azure datacenter WUE ≈ 1.0 L / kWh (facility only) or 1.6 – 1.8 L / kWh including grid water.",
  cost = 0.02,
  costDescription = "Approximate combined cost per agentic request, including API usage, energy, and infrastructure overhead. Reflects a single GPT-4o API invocation in a LangChain workflow."
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Sustainability Metrics</h3>
        <p className="text-sm text-gray-600">Environmental impact and cost per request</p>
      </div>

      {/* Metrics Grid - Single Row */}
      <div className="grid grid-cols-4 gap-4">
        {/* Energy Usage */}
        <div className="flex items-start gap-3 group relative">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
            <Bolt className="text-yellow-600" sx={{ fontSize: 20 }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Energy
            </p>
            <p className="text-lg font-bold text-gray-900">
              {energyKwh.toFixed(4)} kWh
            </p>
            <p className="text-xs text-gray-500 mt-0.5">per request</p>
          </div>
          {/* Tooltip */}
          <div className="absolute hidden group-hover:block z-50 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2">
            {energyDescription}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>

        {/* CO2 Emissions */}
        <div className="flex items-start gap-3 group relative">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Nature className="text-green-600" sx={{ fontSize: 20 }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              CO₂
            </p>
            <p className="text-lg font-bold text-gray-900">
              {co2Grams.toFixed(3)} g
            </p>
            <p className="text-xs text-gray-500 mt-0.5">per request</p>
          </div>
          {/* Tooltip */}
          <div className="absolute hidden group-hover:block z-50 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2">
            {co2Description}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>

        {/* Water Usage */}
        <div className="flex items-start gap-3 group relative">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Water className="text-blue-600" sx={{ fontSize: 20 }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Water
            </p>
            <p className="text-lg font-bold text-gray-900">
              {waterLiters} L
            </p>
            <p className="text-xs text-gray-500 mt-0.5">per request</p>
          </div>
          {/* Tooltip */}
          <div className="absolute hidden group-hover:block z-50 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2">
            {waterDescription}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>

        {/* Cost */}
        <div className="flex items-start gap-3 group relative">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <AttachMoney className="text-purple-600" sx={{ fontSize: 20 }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Cost
            </p>
            <p className="text-lg font-bold text-gray-900">
              ${cost.toFixed(4)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">per request</p>
          </div>
          {/* Tooltip */}
          <div className="absolute hidden group-hover:block z-50 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl bottom-full left-1/2 -translate-x-1/2 mb-2">
            {costDescription}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityScoreCard;
